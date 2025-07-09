import React, { useState, useEffect } from 'react';
import { PaperPlaneIcon } from '@radix-ui/react-icons';

export default function MessageInput({ onSendMessage, onTyping }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTyping) {
        onTyping(false);
        setIsTyping(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isTyping, onTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSendMessage(message);
    setMessage('');
    onTyping(false);
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (!isTyping) {
      onTyping(true);
      setIsTyping(true);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full px-4 py-3 bg-white border-t shadow-inner"
    >
      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 shadow-sm">
        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-sm md:text-base outline-none px-2 py-1"
        />
        <button
          type="submit"
          className="flex items-center justify-center bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-200"
          title="Send"
        >
          <PaperPlaneIcon className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
