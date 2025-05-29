import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Save, Clipboard, ArrowRight, X, Clock, Dumbbell } from 'lucide-react';

interface WorkoutEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  duration: number; // in minutes
  exerciseIds: string[];
  notes?: string;
  completed: boolean;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  workouts: WorkoutEvent[];
  isActive: boolean;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hoursOfDay = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

const mockWorkoutPlans: WorkoutPlan[] = [
  {
    id: '1',
    name: 'Shoulder Rehabilitation',
    description: 'A 4-week plan to recover from shoulder injury',
    workouts: [
      {
        id: '101',
        title: 'Upper Body Session',
        date: '2025-05-10',
        startTime: '09:00',
        duration: 30,
        exerciseIds: ['1', '3', '5'],
        notes: 'Focus on proper form',
        completed: false
      },
      {
        id: '102',
        title: 'Mobility Work',
        date: '2025-05-12',
        startTime: '16:00',
        duration: 20,
        exerciseIds: ['1', '5'],
        completed: false
      }
    ],
    isActive: true
  },
  {
    id: '2',
    name: 'Knee Recovery Plan',
    description: 'Gradual strengthening for ACL recovery',
    workouts: [
      {
        id: '201',
        title: 'Leg Strengthening',
        date: '2025-05-11',
        startTime: '10:00',
        duration: 45,
        exerciseIds: ['2', '4', '6'],
        notes: 'Start with light resistance',
        completed: false
      }
    ],
    isActive: false
  }
];

// Generate dates for the current week
const generateWeekDates = (selectedDate: Date) => {
  const dates = [];
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // Start from Sunday
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

const Planner: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [plans, setPlans] = useState<WorkoutPlan[]>(mockWorkoutPlans);
  const [selectedPlan, setSelectedPlan] = useState<string>(mockWorkoutPlans[0].id);
  const [showAddEvent, setShowAddEvent] = useState<boolean>(false);
  const [newEvent, setNewEvent] = useState<Partial<WorkoutEvent>>({
    title: '',
    date: selectedDate.toISOString().split('T')[0],
    startTime: '09:00',
    duration: 30,
    exerciseIds: [],
    notes: '',
    completed: false
  });
  
  const weekDates = generateWeekDates(selectedDate);
  
  const activePlan = plans.find(plan => plan.id === selectedPlan);
  
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return activePlan?.workouts.filter(event => event.date === dateString) || [];
  };
  
  const handlePreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };
  
  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };
  
  const handleAddEvent = () => {
    if (!newEvent.title) return;
    
    const event: WorkoutEvent = {
      id: Date.now().toString(),
      title: newEvent.title || 'New Workout',
      date: newEvent.date || selectedDate.toISOString().split('T')[0],
      startTime: newEvent.startTime || '09:00',
      duration: newEvent.duration || 30,
      exerciseIds: newEvent.exerciseIds || [],
      notes: newEvent.notes,
      completed: false
    };
    
    setPlans(plans.map(plan => 
      plan.id === selectedPlan 
        ? { ...plan, workouts: [...plan.workouts, event] } 
        : plan
    ));
    
    // Reset form
    setNewEvent({
      title: '',
      date: selectedDate.toISOString().split('T')[0],
      startTime: '09:00',
      duration: 30,
      exerciseIds: [],
      notes: '',
      completed: false
    });
    setShowAddEvent(false);
  };
  
  const handleDeleteEvent = (eventId: string) => {
    setPlans(plans.map(plan => 
      plan.id === selectedPlan 
        ? { ...plan, workouts: plan.workouts.filter(event => event.id !== eventId) } 
        : plan
    ));
  };
  
  const handleToggleComplete = (eventId: string) => {
    setPlans(plans.map(plan => 
      plan.id === selectedPlan 
        ? { 
            ...plan, 
            workouts: plan.workouts.map(event => 
              event.id === eventId 
                ? { ...event, completed: !event.completed } 
                : event
            ) 
          } 
        : plan
    ));
  };
  
  const handleActivatePlan = (planId: string) => {
    setPlans(plans.map(plan => 
      ({ ...plan, isActive: plan.id === planId })
    ));
    setSelectedPlan(planId);
  };

  // AI suggestion for workout plan
  const generateAiWorkoutPlan = () => {
    // In a real app, this would call an API to generate a personalized plan
    const newPlan: WorkoutPlan = {
      id: Date.now().toString(),
      name: 'AI-Generated Recovery Plan',
      description: 'Personalized plan based on your recovery progress and goals',
      workouts: [
        {
          id: 'ai-101',
          title: 'Morning Mobility',
          date: new Date().toISOString().split('T')[0],
          startTime: '08:00',
          duration: 20,
          exerciseIds: ['1', '3'],
          notes: 'Focus on gentle movement and range of motion',
          completed: false
        },
        {
          id: 'ai-102',
          title: 'Strength Building',
          date: (() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
          })(),
          startTime: '17:00',
          duration: 30,
          exerciseIds: ['2', '4', '6'],
          notes: 'Gradually increase resistance as comfortable',
          completed: false
        }
      ],
      isActive: false
    };
    
    setPlans([...plans, newPlan]);
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
            Workout Planner
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Plan and schedule your rehabilitation exercises
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            type="button"
            onClick={generateAiWorkoutPlan}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
          >
            <Clipboard className="h-4 w-4 mr-2" />
            Generate AI Plan
          </button>
          <button
            type="button"
            onClick={() => setShowAddEvent(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Workout
          </button>
        </div>
      </div>
      
      {/* Workout Plans selector */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-neutral-900 mb-4">Your Workout Plans</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  plan.id === selectedPlan
                    ? 'border-primary-500 bg-primary-50 shadow-sm'
                    : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-neutral-900">{plan.name}</h4>
                  {plan.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivatePlan(plan.id);
                      }}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500"
                    >
                      Activate
                    </button>
                  )}
                </div>
                {plan.description && (
                  <p className="mt-1 text-sm text-neutral-600">{plan.description}</p>
                )}
                <div className="mt-2 text-xs text-neutral-500">
                  {plan.workouts.length} workouts scheduled
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Calendar Week View */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-neutral-900">
              Schedule for {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              {activePlan?.name || 'No active plan selected'}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handlePreviousWeek}
              className="inline-flex items-center px-3 py-1.5 border border-neutral-300 text-sm leading-5 font-medium rounded-md text-neutral-700 bg-white hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(new Date())}
              className="inline-flex items-center px-3 py-1.5 border border-neutral-300 text-sm leading-5 font-medium rounded-md text-neutral-700 bg-white hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              className="inline-flex items-center px-3 py-1.5 border border-neutral-300 text-sm leading-5 font-medium rounded-md text-neutral-700 bg-white hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Next
            </button>
          </div>
        </div>
        
        {/* Calendar grid */}
        <div className="border-t border-neutral-200">
          <div className="grid grid-cols-7 border-b border-neutral-200">
            {weekDates.map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={index}
                  className={`py-2 text-center ${isToday ? 'bg-primary-50' : ''}`}
                >
                  <p className="text-sm font-medium text-neutral-900">{daysOfWeek[date.getDay()]}</p>
                  <p className={`text-sm ${isToday ? 'font-bold text-primary-600' : 'text-neutral-500'}`}>
                    {date.getDate()}
                  </p>
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-7 divide-x divide-neutral-200 h-96 overflow-auto">
            {weekDates.map((date, dateIndex) => (
              <div key={dateIndex} className="min-h-full relative">
                {getEventsForDate(date).map((event, eventIndex) => {
                  // Calculate position based on time
                  const [hours, minutes] = event.startTime.split(':').map(Number);
                  const startHour = hours + minutes / 60;
                  const startPercentage = ((startHour - 8) / 12) * 100; // 8AM to 8PM = 12 hours
                  const durationPercentage = (event.duration / 60) * (100 / 12); // Convert minutes to percentage of our 12 hour view
                  
                  return (
                    <div
                      key={eventIndex}
                      className={`absolute left-0 right-0 mx-1 p-2 rounded-md shadow-sm text-xs ${
                        event.completed 
                          ? 'bg-success-100 border border-success-300' 
                          : 'bg-primary-100 border border-primary-300'
                      }`}
                      style={{
                        top: `${startPercentage}%`,
                        height: `${Math.max(durationPercentage, 8)}%`, // Minimum height
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium">{event.title}</div>
                        <div className="flex space-x-1">
                          <button 
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              event.completed 
                                ? 'bg-success-500 border-success-600 text-white' 
                                : 'border-neutral-400 hover:border-primary-500'
                            }`}
                            onClick={() => handleToggleComplete(event.id)}
                            aria-label={event.completed ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {event.completed && <Check className="w-3 h-3" />}
                          </button>
                          <button
                            className="text-neutral-500 hover:text-error-500"
                            onClick={() => handleDeleteEvent(event.id)}
                            aria-label="Delete event"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center mt-1 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {event.startTime} · {event.duration} min
                      </div>
                      {event.exerciseIds.length > 0 && (
                        <div className="flex items-center mt-1 text-xs">
                          <Dumbbell className="w-3 h-3 mr-1" />
                          {event.exerciseIds.length} exercises
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setShowAddEvent(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-neutral-900">Add New Workout</h3>
                <button
                  type="button"
                  className="text-neutral-500 hover:text-neutral-700"
                  onClick={() => setShowAddEvent(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="event-title" className="block text-sm font-medium text-neutral-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="event-title"
                    value={newEvent.title || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="event-date" className="block text-sm font-medium text-neutral-700">
                    Date
                  </label>
                  <input
                    type="date"
                    id="event-date"
                    value={newEvent.date || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-time" className="block text-sm font-medium text-neutral-700">
                      Time
                    </label>
                    <input
                      type="time"
                      id="event-time"
                      value={newEvent.startTime || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="event-duration" className="block text-sm font-medium text-neutral-700">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      id="event-duration"
                      value={newEvent.duration || 30}
                      min="5"
                      max="180"
                      step="5"
                      onChange={(e) => setNewEvent({ ...newEvent, duration: parseInt(e.target.value) })}
                      className="mt-1 block w-full rounded-md border border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="event-notes" className="block text-sm font-medium text-neutral-700">
                    Notes
                  </label>
                  <textarea
                    id="event-notes"
                    rows={2}
                    value={newEvent.notes || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setShowAddEvent(false)}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddEvent}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Add Workout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Check component for rendering in the calendar
const Check: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
};

export default Planner;