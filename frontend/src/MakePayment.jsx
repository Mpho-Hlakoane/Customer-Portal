import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css'; 

export default function MakePayment() {
  const [form, setForm] = useState({
    amount: '',
    currency: 'USD',
    provider: 'SWIFT',
    payeeAccount: '',
    swiftCode: '',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      errs.amount = 'Enter a valid amount';
    }
    if (!form.payeeAccount.match(/^\d{10,12}$/)) {
      errs.payeeAccount = 'Account must be 10–12 digits';
    }
    if (!form.swiftCode.match(/^[A-Z0-9]{8,11}$/)) {
      errs.swiftCode = 'SWIFT code must be 8–11 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = name === 'swiftCode' ? value.toUpperCase() : value;
    setForm({ ...form, [name]: val });
    setErrors({ ...errors, [name]: '' });
    setMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setConfirming(true);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/pay', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Payment submitted!');
      setForm({ amount: '', currency: 'USD', provider: 'SWIFT', payeeAccount: '', swiftCode: '' });
      setErrors({});
      setConfirming(false);
    } catch (error) {
      setMessage(`❌ ${error.response?.data || 'Payment failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const cancelConfirm = () => {
    setConfirming(false);
    setMessage('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="home-container">
      <div className="auth-wrapper">
        <div className="auth-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Make a Payment</h2>
          </div>

          {!confirming ? (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                />
                {errors.amount && <div className="error">{errors.amount}</div>}
              </div>

              <div className="form-group">
                <label>Currency:</label>
                <select name="currency" value={form.currency} onChange={handleChange}>
                  <option value="USD">USD</option>
                  <option value="ZAR">ZAR</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              <div className="form-group">
                <label>Payee Account Number:</label>
                <input
                  type="text"
                  name="payeeAccount"
                  value={form.payeeAccount}
                  onChange={handleChange}
                />
                {errors.payeeAccount && <div className="error">{errors.payeeAccount}</div>}
              </div>

              <div className="form-group">
                <label>SWIFT Code:</label>
                <input
                  type="text"
                  name="swiftCode"
                  value={form.swiftCode}
                  onChange={handleChange}
                />
                {errors.swiftCode && <div className="error">{errors.swiftCode}</div>}
              </div>

              <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <button type="submit" disabled={loading}>
                 {loading ? 'Processing...' : 'Pay Now'}
               </button>
               <button type="button" onClick={handleLogout} className="secondary-btn">
                 Logout
               </button>
              </div>
            </form>
          ) : (
            <div>
              <h3>Confirm Your Payment</h3>
              <p><strong>Amount:</strong> {form.amount} {form.currency}</p>
              <p><strong>Payee:</strong> {form.payeeAccount}</p>
              <p><strong>SWIFT:</strong> {form.swiftCode}</p>
              <button onClick={handleConfirm} disabled={loading}>Confirm</button>
              <button onClick={cancelConfirm} style={{ marginLeft: '1rem' }}>Cancel</button>
            </div>
          )}

          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
}
