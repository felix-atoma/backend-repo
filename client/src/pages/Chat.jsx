import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import UserList from '../components/UserList';

export default function Chat() {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('global');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('join_room', { 
      username: user.username, 
      roomId: currentRoom 
    });

    socket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('user_list', (userList) => {
      setUsers(userList);
    });

    socket.on('typing_users', (usersTyping) => {
      setTypingUsers(usersTyping);
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_list');
      socket.off('typing_users');
    };
  }, [socket, user, currentRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Chat Rooms</h2>
        </div>
        <div className="p-2">
          <button
            onClick={() => setCurrentRoom('global')}
            className={`w-full p-2 text-left rounded ${currentRoom === 'global' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          >
            # Global
          </button>
        </div>
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Online Users ({users.length})</h2>
        </div>
        <UserList users={users} />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
            {currentRoom === 'global' ? 'Global Chat' : `Room: ${currentRoom}`}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          <MessageList 
            messages={messages} 
            currentUserId={socket?.id} 
          />
          <div ref={messagesEndRef} />
        </div>

        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2 italic text-gray-500 text-sm">
            {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
          </div>
        )}

        {/* Message input */}
        <MessageInput 
          socket={socket} 
          currentRoom={currentRoom} 
          currentUser={user} 
        />
      </div>
    </div>
  );
}