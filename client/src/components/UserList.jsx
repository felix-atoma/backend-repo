import React from 'react';
import { useEffect, useState } from 'react';

export default function UserList({ users, activeUser, onSelectUser }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-2 border-b">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-2 border rounded-lg text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="p-2">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className={`flex items-center p-2 mb-1 rounded cursor-pointer ${
              activeUser?.id === user.id ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
            onClick={() => onSelectUser(user)}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="truncate">{user.username}</span>
            {activeUser?.id === user.id && (
              <span className="ml-auto text-xs text-gray-500">private</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}