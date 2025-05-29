import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './Home.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import MakePayment from './MakePayment.jsx';
import EmployeeDashboard from './EmployeeDashboard.jsx';
import './AuthForm.css'; 
import "./Home.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogin = (jwtToken) => {
    const payload = JSON.parse(atob(jwtToken.split('.')[1]));
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('role', payload.role);
    setToken(jwtToken);
    setRole(payload.role);
  };

  return (
    <div className="home-container">
      <div className="auth-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/make-payment"
            element={
              token && role === 'customer' ? (
                <MakePayment />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/employee-dashboard"
            element={
              token && role === 'employee' ? (
                <EmployeeDashboard />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
        </Routes>
      </div>

      <footer className="footer">
        <p>Follow us on:</p>
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
