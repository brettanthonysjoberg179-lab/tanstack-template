import { memo } from 'react';

export const LoadingIndicator = memo(() => (
  <div className="py-6">
    <div className="flex items-start w-full max-w-3xl gap-4 mx-auto">
      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 ml-4 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
        AI
      </div>
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm text-gray-400">AI is thinking...</span>
        </div>
      </div>
    </div>
  </div>
));

LoadingIndicator.displayName = 'LoadingIndicator'; 