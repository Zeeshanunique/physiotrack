import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, Sparkles, Calendar } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  actions?: ChatAction[];
}

interface ChatAction {
  id: string;
  type: 'suggestion' | 'schedule' | 'exercise' | 'link';
  label: string;
  data?: any;
}

const AIAssistant: React.FC = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi ${user?.displayName || 'there'}! I'm your PhysioTrack assistant. I can help with your rehabilitation, exercise recommendations, scheduling, and tracking your progress. How can I assist you today?`,
      sender: 'ai',
      timestamp: new Date(),
      actions: [
        { id: 'a1', type: 'suggestion', label: 'Create a workout plan' },
        { id: 'a2', type: 'suggestion', label: 'Track my progress' },
        { id: 'a3', type: 'suggestion', label: 'Exercise recommendations' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Context tracking for conversation
  const conversationContextRef = useRef<{
    lastTopic?: string;
    userPreferences?: {
      preferredExerciseTypes?: string[];
      availableTime?: number;
      recoveryGoals?: string[];
    };
    exercisePlan?: {
      isCreating: boolean;
      exercises: string[];
      frequency: number;
      duration: number;
    }
  }>({
    userPreferences: {
      preferredExerciseTypes: [],
      availableTime: 30,
      recoveryGoals: []
    },
    exercisePlan: {
      isCreating: false,
      exercises: [],
      frequency: 3,
      duration: 30
    }
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent, suggestedText?: string) => {
    if (e) e.preventDefault();
    const messageText = suggestedText || input;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Update context based on user message
    updateConversationContext(messageText);
    
    // Generate AI response with streaming effect
    generateAIResponse(messageText);
  };

  // Update conversation context based on user input
  const updateConversationContext = (userInput: string) => {
    const input = userInput.toLowerCase();
    const context = conversationContextRef.current;
    
    // Track topic
    if (input.includes('plan') || input.includes('schedule')) {
      context.lastTopic = 'planning';
    } else if (input.includes('progress') || input.includes('improve')) {
      context.lastTopic = 'progress';
    } else if (input.includes('exercise') || input.includes('workout')) {
      context.lastTopic = 'exercises';
    } else if (input.includes('pain') || input.includes('hurt')) {
      context.lastTopic = 'pain';
    }
    
    // Track preferences
    if (input.includes('upper body') || input.includes('shoulder') || input.includes('arm')) {
      context.userPreferences!.preferredExerciseTypes = 
        [...(context.userPreferences!.preferredExerciseTypes || []), 'upper'];
    }
    if (input.includes('lower body') || input.includes('knee') || input.includes('leg')) {
      context.userPreferences!.preferredExerciseTypes = 
        [...(context.userPreferences!.preferredExerciseTypes || []), 'lower'];
    }
    
    // Track exercise plan creation
    if (input.includes('create') && (input.includes('plan') || input.includes('schedule'))) {
      context.exercisePlan!.isCreating = true;
    }
    
    // Extract time information
    const timeRegex = /(\d+)\s*(minutes|minute|min)/i;
    const timeMatch = input.match(timeRegex);
    if (timeMatch) {
      context.userPreferences!.availableTime = parseInt(timeMatch[1]);
    }
  };

  // Generate AI response with context-awareness
  const generateAIResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    const context = conversationContextRef.current;
    
    let aiResponse = '';
    let actions: ChatAction[] = [];
    
    // Delayed typing effect
    const simulateTyping = (text: string, actionList: ChatAction[] = []) => {
      setIsTyping(true);
      
      // Split response into chunks to simulate typing
      const words = text.split(' ');
      let currentText = '';
      let wordIndex = 0;
      
      const typingInterval = setInterval(() => {
        if (wordIndex < words.length) {
          currentText += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
          wordIndex++;
          
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: currentText,
            sender: 'ai',
            timestamp: new Date(),
            actions: wordIndex === words.length ? actionList : undefined
          };
          
          setMessages(prev => {
            // Replace the last AI message if it exists and is from AI
            if (prev.length > 0 && prev[prev.length - 1].sender === 'ai') {
              return [...prev.slice(0, prev.length - 1), aiMessage];
            }
            return [...prev, aiMessage];
          });
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 20); // Adjust speed as needed
    };
    
    // Generate response based on context and input
    if (context.exercisePlan!.isCreating) {
      aiResponse = generatePlanningResponse(input);
      actions = [
        { id: 'p1', type: 'schedule', label: 'View suggested schedule' },
        { id: 'p2', type: 'suggestion', label: 'Customize plan' }
      ];
    } else if (input.includes('pain') || input.includes('hurt')) {
      aiResponse = "I notice you mentioned pain. If you're experiencing pain during exercises, you should stop immediately. Pain is different from the normal discomfort of exercise. Would you like me to suggest some gentler alternatives or should you consider consulting with your healthcare provider?";
      actions = [
        { id: 'pain1', type: 'suggestion', label: 'Suggest gentler exercises' },
        { id: 'pain2', type: 'suggestion', label: 'When to see a doctor' }
      ];
    } else if (input.includes('schedule') || input.includes('plan')) {
      aiResponse = "I can help you create a personalized workout schedule. Based on your profile and progress, I recommend focusing on 3-4 sessions per week, alternating between upper and lower body exercises with rest days in between. Would you like me to create a draft schedule for you?";
      actions = [
        { id: 'sched1', type: 'schedule', label: 'Create weekly schedule' },
        { id: 'sched2', type: 'suggestion', label: 'Learn about recovery time' }
      ];
    } else if (input.includes('progress') || input.includes('improve')) {
      aiResponse = "Your progress has been steady! You've improved your range of motion by approximately 18% since starting. Your strength metrics show consistent gains, particularly in your shoulder exercises. Keep up with the consistent practice, and remember that recovery is a marathon, not a sprint.";
      actions = [
        { id: 'prog1', type: 'suggestion', label: 'View detailed progress' },
        { id: 'prog2', type: 'suggestion', label: 'Set new goals' }
      ];
    } else if (input.includes('exercise') || input.includes('recommend')) {
      aiResponse = "Based on your recent activity and progress, I'd recommend focusing on these exercises today: 1) Shoulder External Rotation - great for improving rotator cuff strength and stability, 2) Wall Slides - excellent for shoulder mobility, and 3) Hip Bridge - to strengthen your core and lower body support. Would you like to start one of these now?";
      actions = [
        { id: 'ex1', type: 'exercise', label: 'Start Shoulder External Rotation' },
        { id: 'ex2', type: 'exercise', label: 'Start Wall Slides' },
        { id: 'ex3', type: 'exercise', label: 'View all recommended exercises' }
      ];
    } else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      aiResponse = `Hello ${user?.displayName || 'there'}! How are you feeling today? Is there anything specific about your rehabilitation program you'd like to discuss? I can help with exercise recommendations, scheduling, progress tracking, and general physiotherapy advice.`;
      actions = [
        { id: 'hi1', type: 'suggestion', label: "What's on my schedule today?" },
        { id: 'hi2', type: 'suggestion', label: 'Recommend an exercise' },
        { id: 'hi3', type: 'suggestion', label: 'Show my progress' }
      ];
    } else if (input.includes('create') && input.includes('workout') && (input.includes('plan') || input.includes('schedule'))) {
      context.exercisePlan!.isCreating = true;
      aiResponse = "I'd be happy to help you create a personalized workout plan. To create the most effective plan, I'll need to know a few things. What specific area are you looking to rehabilitate? How much time do you have available for exercises each day? And are there any particular goals you have for your recovery?";
      actions = [
        { id: 'create1', type: 'suggestion', label: 'Shoulder rehabilitation' },
        { id: 'create2', type: 'suggestion', label: 'Knee recovery' },
        { id: 'create3', type: 'suggestion', label: 'General mobility improvement' }
      ];
    } else {
      aiResponse = "That's an interesting question. I can help with exercise recommendations, scheduling, progress tracking, and general physiotherapy advice. Could you provide more details about what you're looking for? I'm here to assist with your rehabilitation journey.";
      actions = [
        { id: 'default1', type: 'suggestion', label: 'Recommend exercises' },
        { id: 'default2', type: 'suggestion', label: 'Create a workout plan' },
        { id: 'default3', type: 'suggestion', label: 'Track my progress' }
      ];
    }
    
    // Start the typing simulation
    simulateTyping(aiResponse, actions);
  };

  // Generate response for planning context
  const generatePlanningResponse = (input: string): string => {
    const context = conversationContextRef.current;
    
    // First message in planning flow
    if (!context.userPreferences?.preferredExerciseTypes?.length) {
      return "I'll help you create a personalized workout plan. What area would you like to focus on: upper body, lower body, core, or full body?";
    }
    
    // Second message - time availability
    if (!input.includes('minute') && !input.includes('hour') && context.userPreferences?.availableTime === 30) {
      const focusArea = context.userPreferences?.preferredExerciseTypes?.join(' and ') || 'general';
      return `Great! I'll focus on ${focusArea} body exercises. How much time do you have available for each session? A typical session might be 20-45 minutes.`;
    }
    
    // Third message - frequency
    if (input.includes('minute') || input.includes('hour')) {
      const minutes = context.userPreferences?.availableTime || 30;
      return `Perfect. I'll create a plan with ${minutes}-minute sessions. How many days per week would you like to exercise? For rehabilitation, I typically recommend 3-4 days with rest days in between.`;
    }
    
    // Final plan creation
    if (input.includes('day') || input.includes('week') || /\d+/.test(input)) {
      const focusArea = context.userPreferences?.preferredExerciseTypes?.join(' and ') || 'general';
      const minutes = context.userPreferences?.availableTime || 30;
      const frequency = input.includes('3') ? 3 : input.includes('4') ? 4 : input.includes('5') ? 5 : 3;
      
      context.exercisePlan!.isCreating = false;
      
      return `I've created a personalized ${focusArea} body rehabilitation plan for you with ${frequency} ${minutes}-minute sessions per week. The plan includes a mix of mobility, strength, and stability exercises tailored to your needs. I've scheduled these in your calendar with appropriate rest days. Would you like to view the plan now or make adjustments?`;
    }
    
    return "I'm building your customized workout plan. Could you please provide a few more details about your specific rehabilitation goals? For example, are you looking to increase range of motion, reduce pain, or build strength?";
  };

  // Handle chat action clicks
  const handleActionClick = (action: ChatAction) => {
    switch (action.type) {
      case 'suggestion':
        handleSendMessage(undefined, action.label);
        break;
      case 'schedule':
        // In a real app, would navigate to planner or open schedule modal
        handleSendMessage(undefined, "Show me my schedule");
        break;
      case 'exercise':
        // In a real app, would navigate to exercise page
        handleSendMessage(undefined, `I want to do ${action.label.replace('Start ', '')}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-medium text-neutral-900">AI Physiotherapy Assistant</h2>
        </div>
        <p className="text-sm text-neutral-500">Your personal rehabilitation coach and workout buddy</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-xs md:max-w-md ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                message.sender === 'user' ? 'bg-primary-600 ml-2' : 'bg-neutral-200 mr-2'
              }`}>
                {message.sender === 'user' ? (
                  <User className="h-5 w-5 text-white" />
                ) : (
                  <Bot className="h-5 w-5 text-neutral-700" />
                )}
              </div>
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action)}
                        className={`px-2 py-1 text-xs rounded-full transition-colors ${
                          action.type === 'schedule' 
                            ? 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                            : action.type === 'exercise'
                              ? 'bg-success-100 text-success-800 hover:bg-success-200'
                              : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'
                        } flex items-center`}
                      >
                        {action.type === 'schedule' && <Calendar className="h-3 w-3 mr-1" />}
                        {action.type === 'exercise' && <Dumbbell className="h-3 w-3 mr-1" />}
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex max-w-xs md:max-w-md flex-row">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-neutral-200 mr-2 flex items-center justify-center">
                <Bot className="h-5 w-5 text-neutral-700" />
              </div>
              <div className="rounded-lg px-4 py-2 bg-neutral-100 text-neutral-800">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-neutral-200">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value) {
                setShowSuggestions(false);
              } else {
                setShowSuggestions(true);
              }
            }}
            placeholder="Ask anything about your rehabilitation..."
            className="flex-1 focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md sm:text-sm border-neutral-300"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        
        {showSuggestions && (
          <div className="mt-2 flex flex-wrap gap-2">
            {["What exercises can help my shoulder?", "Create a weekly workout plan", "How's my progress?", "Recommend an exercise for today"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInput(suggestion);
                  setShowSuggestions(false);
                }}
                className="px-2 py-1 bg-neutral-100 rounded-full text-xs hover:bg-neutral-200 text-neutral-700"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper components
const Dumbbell: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 5v14"></path>
      <path d="M18 5v14"></path>
      <path d="M3 7h3"></path>
      <path d="M3 17h3"></path>
      <path d="M18 7h3"></path>
      <path d="M18 17h3"></path>
      <path d="M6 12h12"></path>
    </svg>
  );
};

export default AIAssistant;