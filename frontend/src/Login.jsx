import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './AuthForm.css';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({
    role: '',
    employeeId: '',
    username: '',
    accountNumber: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.role) errs.role = 'Please select a role';

    if (form.role === 'employee') {
      if (!form.username || !/^[a-zA-Z0-9_]{4,20}$/.test(form.username)) {
        errs.username = 'Username must be 4–20 characters, alphanumeric/underscore only';
      }
      if (!form.employeeId || !/^[a-zA-Z0-9]{4,20}$/.test(form.employeeId)) {
        errs.employeeId = 'Employee ID must be 4–20 alphanumeric characters';
      }
    }

    if (form.role === 'customer') {
      if (!form.username || !/^[a-zA-Z0-9_]{4,20}$/.test(form.username)) {
        errs.username = 'Username must be 4–20 characters, alphanumeric/underscore only';
      }
      if (!/^\d{10,12}$/.test(form.accountNumber)) {
        errs.accountNumber = 'Account number must be 10–12 digits';
      }
    }

    if (!form.password || form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage('');

    try {
      const endpoint =
        form.role === 'employee'
          ? 'http://localhost:5000/api/employee-login'
          : 'http://localhost:5000/api/login';

      const payload =
        form.role === 'employee'
          ? { username: form.username, employeeId: form.employeeId, password: form.password }
          : { username: form.username, accountNumber: form.accountNumber, password: form.password };

      const res = await axios.post(endpoint, payload);
      const jwtToken = res.data.token;

      if (onLogin) onLogin(jwtToken);

      if (form.rememberMe) {
        localStorage.setItem('jwtToken', jwtToken); 
      }

      setMessage('✅ Login successful!');

      setTimeout(() => {
        if (form.role === 'customer') {
          navigate('/make-payment');
        } else {
          navigate('/employee-dashboard');
        }
      }, 1000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Login failed'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="auth-wrapper">
        <form onSubmit={handleSubmit} className="auth-container" noValidate>
          <h2>Login</h2>

          <div className="form-group">
            <label>Role:</label>
            <select name="role" value={form.role} onChange={handleChange} className="auth-select">
              <option value="">Select Role</option>
              <option value="customer">Customer</option>
              <option value="employee">Employee</option>
            </select>
            {errors.role && <div className="error">{errors.role}</div>}
          </div>

          {form.role === 'employee' && (
            <>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                />
                {errors.username && <div className="error">{errors.username}</div>}
              </div>

              <div className="form-group">
                <label>Employee ID:</label>
                <input
                  type="text"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                />
                {errors.employeeId && <div className="error">{errors.employeeId}</div>}
              </div>
            </>
          )}

          {form.role === 'customer' && (
            <>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                />
                {errors.username && <div className="error">{errors.username}</div>}
              </div>

              <div className="form-group">
                <label>Account Number:</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={form.accountNumber}
                  onChange={handleChange}
                />
                {errors.accountNumber && (
                  <div className="error">{errors.accountNumber}</div>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <div className="error">{errors.password}</div>}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {message && <p className="message">{message}</p>}

          <div className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        
          <div className="remember-me">
             <input type="checkbox" id="rememberMe" name="rememberMe" />
             <label htmlFor="rememberMe">Remember Me</label>
          </div> 

          <p>
            Don’t have an account? <Link to="/register">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
 