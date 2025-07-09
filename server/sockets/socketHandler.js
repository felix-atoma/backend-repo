module.exports = (io) => {
  const users = new Map(); // Using Map for better performance
  const messages = [];
  const typingUsers = new Map();
  const privateRooms = new Map(); // For tracking private conversations

  // Helper function to broadcast user list updates
  const broadcastUserList = () => {
    io.emit('user_list', Array.from(users.values()));
  };

  // Helper function to broadcast typing users
  const broadcastTypingUsers = () => {
    io.emit('typing_users', Array.from(typingUsers.values()));
  };

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // User joins
    socket.on('user_join', (username, callback) => {
      try {
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
          throw new Error('Invalid username');
        }

        // Check if username is already taken
        const usernameExists = Array.from(users.values()).some(
          user => user.username.toLowerCase() === username.toLowerCase()
        );

        if (usernameExists) {
          throw new Error('Username already taken');
        }

        users.set(socket.id, { 
          username: username.trim(), 
          id: socket.id,
          joinedAt: new Date().toISOString()
        });

        broadcastUserList();
        io.emit('user_joined', { 
          username: username.trim(), 
          id: socket.id,
          timestamp: new Date().toISOString()
        });

        // Send message history (last 50 messages)
        socket.emit('message_history', messages.slice(-50));

        if (typeof callback === 'function') {
          callback({ status: 'success', userId: socket.id });
        }
      } catch (error) {
        console.error(`❌ user_join error: ${error.message}`);
        if (typeof callback === 'function') {
          callback({ status: 'error', message: error.message });
        }
      }
    });

    // Send message
    socket.on('send_message', (messageData, callback) => {
      try {
        if (!users.has(socket.id)) {
          throw new Error('User not authenticated');
        }

        if (!messageData?.message || typeof messageData.message !== 'string') {
          throw new Error('Invalid message');
        }

        const user = users.get(socket.id);
        const message = {
          id: Date.now(),
          sender: user.username,
          senderId: socket.id,
          message: messageData.message.trim(),
          timestamp: new Date().toISOString(),
          isPrivate: false
        };

        messages.push(message);
        if (messages.length > 200) messages.shift(); // Keep last 200 messages

        io.emit('receive_message', message);

        if (typeof callback === 'function') {
          callback({ status: 'success', messageId: message.id });
        }
      } catch (error) {
        console.error(`❌ send_message error: ${error.message}`);
        if (typeof callback === 'function') {
          callback({ status: 'error', message: error.message });
        }
      }
    });

    // Typing indicator
    socket.on('typing', (isTyping) => {
      try {
        if (!users.has(socket.id)) return;

        const user = users.get(socket.id);
        if (isTyping) {
          typingUsers.set(socket.id, user.username);
        } else {
          typingUsers.delete(socket.id);
        }
        broadcastTypingUsers();
      } catch (error) {
        console.error(`❌ typing indicator error: ${error.message}`);
      }
    });

    // Private message
    socket.on('private_message', ({ to, message }, callback) => {
      try {
        if (!users.has(socket.id) || !users.has(to)) {
          throw new Error('Invalid users for private message');
        }

        if (!message || typeof message !== 'string') {
          throw new Error('Invalid message content');
        }

        const sender = users.get(socket.id);
        const recipient = users.get(to);

        const messageData = {
          id: Date.now(),
          sender: sender.username,
          senderId: socket.id,
          recipientId: to,
          recipient: recipient.username,
          message: message.trim(),
          timestamp: new Date().toISOString(),
          isPrivate: true
        };

        // Create/join private room if it doesn't exist
        const roomId = [socket.id, to].sort().join('-');
        if (!privateRooms.has(roomId)) {
          socket.join(roomId);
          socket.to(to).join(roomId);
          privateRooms.set(roomId, new Set([socket.id, to]));
        }

        // Emit to the private room
        io.to(roomId).emit('private_message', messageData);

        if (typeof callback === 'function') {
          callback({ status: 'success', messageId: messageData.id });
        }
      } catch (error) {
        console.error(`❌ private_message error: ${error.message}`);
        if (typeof callback === 'function') {
          callback({ status: 'error', message: error.message });
        }
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      try {
        if (users.has(socket.id)) {
          const user = users.get(socket.id);
          console.log(`🔌 User disconnected: ${user.username} (${socket.id})`);

          // Leave all private rooms
          privateRooms.forEach((participants, roomId) => {
            if (participants.has(socket.id)) {
              socket.leave(roomId);
              participants.delete(socket.id);
              if (participants.size < 2) {
                privateRooms.delete(roomId);
              }
            }
          });

          // Notify other users
          io.emit('user_left', { 
            username: user.username, 
            id: socket.id,
            timestamp: new Date().toISOString()
          });

          // Clean up
          users.delete(socket.id);
          typingUsers.delete(socket.id);
          broadcastUserList();
          broadcastTypingUsers();
        }
      } catch (error) {
        console.error(`❌ disconnect handler error: ${error.message}`);
      }
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`❌ Socket error (${socket.id}):`, error.message);
    });
  });
};