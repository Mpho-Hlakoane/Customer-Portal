import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './AuthForm.css';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    idNumber: '',
    accountNumber: '',
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};

    if (!form.fullName.trim()) {
      errs.fullName = 'Full name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(form.fullName)) {
      errs.fullName = 'Only letters and spaces allowed';
    }

    if (!/^\d{13}$/.test(form.idNumber)) {
      errs.idNumber = 'ID number must be exactly 13 digits';
    }

    if (!/^\d{10,12}$/.test(form.accountNumber)) {
      errs.accountNumber = 'Account number must be 10-12 digits';
    }

    if (!form.username.trim()) {
      errs.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]{4,20}$/.test(form.username)) {
      errs.username = 'Username must be 4-20 characters, alphanumeric/underscore only';
    }

    if (!form.password || form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5000/api/register', form);
      setMessage('✅ Registration successful! Please login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form">
      <div className="auth-wrapper">
        <form onSubmit={handleSubmit} className="auth-container" noValidate>
          <h2>Register</h2>

          <div className="form-group">
            <label htmlFor="fullName">Full Name:</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <div className="error">{errors.fullName}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="idNumber">ID Number:</label>
            <input
              id="idNumber"
              type="text"
              name="idNumber"
              value={form.idNumber}
              onChange={handleChange}
            />
            {errors.idNumber && <div className="error">{errors.idNumber}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="accountNumber">Account Number:</label>
            <input
              id="accountNumber"
              type="text"
              name="accountNumber"
              value={form.accountNumber}
              onChange={handleChange}
            />
            {errors.accountNumber && <div className="error">{errors.accountNumber}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
            />
            {errors.username && <div className="error">{errors.username}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <div className="error">{errors.password}</div>}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>

          {message && <div className="message">{message}</div>}

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
