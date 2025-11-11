import { Send } from 'lucide-react';

interface WelcomeScreenProps {
  onStartChat: () => void;
}

export const WelcomeScreen = ({ onStartChat }: WelcomeScreenProps) => (
  <div className="flex items-center justify-center flex-1 px-4">
    <div className="w-full max-w-3xl mx-auto text-center">
      <h1 className="mb-4 text-6xl font-bold text-transparent uppercase bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text">
        <span className="text-white">TanStack</span> Chat
      </h1>
      <p className="w-2/3 mx-auto mb-6 text-lg text-gray-400">
        You can ask me about anything, I might or might not have a good
        answer, but you can still ask.
      </p>
      <button
        onClick={onStartChat}
        className="px-6 py-3 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
      >
        Start Chatting
      </button>
      <p className="mt-4 text-xs text-gray-500">
        Press Ctrl+K (⌘K on Mac) to open Quick Action Panel
      </p>
    </div>
  </div>
); 