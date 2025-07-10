import React from 'react';
import { useEffect, useState } from 'react';

export default function MessageInput({ socket, currentRoom, currentUser }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isTyping) {
        socket.emit('typing', { isTyping: false, roomId: currentRoom });
        setIsTyping(false);
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [isTyping, currentRoom, socket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socket.emit('send_message', {
      message,
      roomId: currentRoom,
      timestamp: new Date().toISOString()
    });
    
    setMessage('');
    socket.emit('typing', { isTyping: false, roomId: currentRoom });
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (!isTyping) {
      socket.emit('typing', { isTyping: true, roomId: currentRoom });
      setIsTyping(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={handleChange}
          className="flex-1 p-2 border rounded-l-lg focus:outline-none"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </form>
  );
}