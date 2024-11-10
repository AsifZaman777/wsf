// Login.js
import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const Login = () => {
  const [socketUrl, setSocketUrl] = useState(null); // Initially no connection
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => console.log('Connected to WebSocket'),
    onClose: () => console.log('Disconnected from WebSocket'),
    shouldReconnect: (closeEvent) => true, // Reconnect when connection closes
  });

  // Attempt login and await server response
  const handleLogin = useCallback(() => {
    const loginData = {
      type: 'login',
      username,
      password,
    };

    // Temporarily create a WebSocket for login only
    const loginSocket = new WebSocket('ws://localhost:8080');
    loginSocket.onopen = () => loginSocket.send(JSON.stringify(loginData));

    loginSocket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      setResponseMessage(response.message);

      if (response.status === 'success') {
        setIsLoggedIn(true);
        setSocketUrl('ws://localhost:8080'); // Open persistent WebSocket connection
      
      } else {
        loginSocket.close(); // Close on error too
      }
    };
  }, [username, password]);

  useEffect(() => {
    if (lastMessage !== null) {
      const response = JSON.parse(lastMessage.data);
      setResponseMessage(response.message);
    }
  }, [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div>
      <h2>Login</h2>
      {!isLoggedIn ? (
        <>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} disabled={readyState === ReadyState.OPEN}>
            Login
          </button>
        </>
      ) : (
        <p>Welcome, {username}! You are now connected.</p>
      )}
      <p>WebSocket Status: {connectionStatus}</p>
      <p>{responseMessage}</p>
    </div>
  );
};

export default Login;
