import React from 'react';
import AIAssistant from '../../components/chat/AIAssistant';

const Chat: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
            AI Workout Buddy
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Your intelligent assistant for rehabilitation guidance and exercise planning
          </p>
        </div>
      </div>
      
      <AIAssistant />
    </div>
  );
};

export default Chat;