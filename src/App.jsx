import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/dashboard/Dashboard";
import Login from "./components/login/Login";
import { WebSocketProvider } from "./context/WebSocketContext";

const App = () => {
  return (
    <WebSocketProvider>
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
    </WebSocketProvider>
  );
};

export default App;