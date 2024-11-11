import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWebSocketContext } from '../../context/WebSocketContext';

const Dashboard = () => {
  const location = useLocation();
  const { username } = location.state || {};
  const { connectionStatus, lastMessage, sendMessage } = useWebSocketContext();

  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Update messages list when a new WebSocket message arrives
  useEffect(() => {
    if (lastMessage) {
      const newMessage = JSON.parse(lastMessage.data);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  }, [lastMessage]);

  // Handle sending messages
  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const messageData = {
        type: 'chat',
        username: username || 'Guest',
        message: chatMessage,
      };
      sendMessage(JSON.stringify(messageData));
      setChatMessage(''); // Clear the input field
    }
  };

  return (
    <div>
      <h2>Welcome, {username ? username : 'Guest'}!</h2>
      <p>WebSocket Status: {connectionStatus}</p>

      <div>
        <h3>Chat</h3>
        <div
          style={{
            border: '1px solid #ccc',
            padding: '10px',
            height: '300px',
            overflowY: 'scroll',
            marginBottom: '10px',
          }}
        >
          {messages.length > 0 ? (
            messages.map((msg, index) => {
              const isCurrentUser = msg.username === username;
              const messageTime = new Date().toLocaleTimeString();
              return (
                <div
                  key={index}
                  style={{
                    padding: '8px',
                    backgroundColor: isCurrentUser ? '#d1f7d1' : '#f1f1f1',
                    borderRadius: '5px',
                    marginBottom: '5px',
                    textAlign: isCurrentUser ? 'left' : 'right', // Align the current user's message to the left
                    marginLeft: isCurrentUser ? '0' : '20px', // Align to the left for current user
                    marginRight: isCurrentUser ? '20px' : '0', // Align to the right for others
                  }}
                >
                  <strong>{msg.username}</strong> ({messageTime}): {msg.message}
                </div>
              );
            })
          ) : (
            <p>No messages yet</p>
          )}
        </div>

        <input
          type="text"
          placeholder="Type a message..."
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          style={{
            width: '80%',
            padding: '5px',
            marginRight: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: '5px 10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            borderRadius: '5px',
            border: 'none',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
