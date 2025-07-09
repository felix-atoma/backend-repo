import React from 'react';
import { useState } from 'react';
import { FaThumbsUp, FaHeart, FaLaugh, FaSurprise, FaSadTear } from 'react-icons/fa';

export default function Message({ message, isCurrentUser }) {
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState(message.reactions || {});

  const reactionIcons = {
    '👍': <FaThumbsUp />,
    '❤️': <FaHeart />,
    '😂': <FaLaugh />,
    '😮': <FaSurprise />,
    '😢': <FaSadTear />,
  };

  const handleReact = (reaction) => {
    // In a real app, you would emit a socket event here
    setReactions(prev => ({
      ...prev,
      [reaction]: (prev[reaction] || 0) + 1
    }));
    setShowReactions(false);
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
          isCurrentUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 rounded-bl-none'
        }`}
      >
        {!isCurrentUser && (
          <div className="font-semibold text-sm">
            {message.sender}
          </div>
        )}
        <div className="text-sm">{message.message}</div>
        <div className="flex justify-between items-center mt-1">
          <div className="text-xs opacity-70">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          
          <div className="flex space-x-1">
            {Object.entries(reactions).map(([reaction, count]) => (
              <span key={reaction} className="text-xs bg-white bg-opacity-20 px-1 rounded">
                {reaction} {count}
              </span>
            ))}
          </div>
        </div>
        
        <div className="relative mt-1">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="text-xs opacity-50 hover:opacity-100"
          >
            React
          </button>
          
          {showReactions && (
            <div className="absolute bottom-full left-0 bg-white shadow-lg rounded-full p-1 flex space-x-1">
              {Object.entries(reactionIcons).map(([reaction, icon]) => (
                <button
                  key={reaction}
                  onClick={() => handleReact(reaction)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  {icon}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}