import React, { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const Dashboard = () => {
  const socketUrl = 'ws://localhost:8080';
  const { sendJsonMessage, lastMessage, readyState, getWebSocket } = useWebSocket(socketUrl, {
    shouldReconnect: (closeEvent) => false,
    manual: true,
  });

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');

  // Load username on initial render
  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || 'Guest';
    setUsername(storedUsername);
  }, []);

  // Disconnect WebSocket
  const handleDisconnect = () => {
    const socket = getWebSocket();
    if (socket) {
      socket.close();
    }
  };

  // Send a message to WebSocket server
  const handleSendMessage = () => {
    if (message.trim() !== '') {
      const outgoingMessage = { username, message };
      sendJsonMessage(outgoingMessage);
      setMessage(''); // Clear the input field after sending
    }
  };

  // Capture and display the latest message received from the server
  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const incomingMessage = JSON.parse(lastMessage.data);
        console.log('Incoming message:', incomingMessage);
        if (incomingMessage && incomingMessage.username && incomingMessage.message) {
          setMessages((prevMessages) => [
            ...prevMessages,
            `${incomingMessage.username}: ${incomingMessage.message}`,
          ]);
        }
      } catch (error) {
        console.error('Error parsing incoming message:', error);
      }
    }
  }, [lastMessage]);

  const connectionStatusMap = {
    [ReadyState.CONNECTING]: 'Connecting...',
    [ReadyState.OPEN]: 'Connected',
    [ReadyState.CLOSING]: 'Closing...',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Welcome to the Dashboard, {username || 'Guest'}!</h2>
      <div>
        <button onClick={handleDisconnect}>Disconnect from WebSocket</button>
      </div>

      <div style={{ marginTop: '20px', color: connectionStatusMap === 'Connected' ? 'green' : 'red' }}>
        {connectionStatusMap}
      </div>

      <h3>Chat Panel</h3>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
        style={{ width: '100%', height: '100px' }}
      />
      <button onClick={handleSendMessage} disabled={readyState !== ReadyState.OPEN}>
        Send Message
      </button>

      <h4>Messages</h4>
      <div
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          maxHeight: '200px',
          overflowY: 'scroll',
        }}
      >
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
