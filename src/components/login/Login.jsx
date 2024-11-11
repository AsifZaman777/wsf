// Login.js
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocketContext } from '../../context/WebSocketContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const navigate = useNavigate();

  const { sendMessage, lastMessage, connectionStatus } = useWebSocketContext();

  const handleLogin = useCallback(() => {
    const loginData = {
      type: 'login',
      username,
      password,
    };

    sendMessage(JSON.stringify(loginData));
  }, [username, password, sendMessage]);

  React.useEffect(() => {
    if (lastMessage !== null) {
      const response = JSON.parse(lastMessage.data);
      setResponseMessage(response.message);

      if (response.status === 'success') {
        navigate('/dashboard', { state: { username, connectionStatus } });
      }
    }
  }, [lastMessage, navigate, username, connectionStatus]);

  return (
    <div>
      <h2>Login</h2>
      <p>Connection Status: {connectionStatus}</p>
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
      <button onClick={handleLogin}>Login</button>
      <p>{responseMessage}</p>
    </div>
  );
};

export default Login;
