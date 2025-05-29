import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function EmployeeDashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); 
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:5000/api/payments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(res.data);
      } catch (err) {
        setError('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPayments();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleAction = async (index, status) => {
    setActionLoading(index);
    setError('');
    try {
      await axios.patch(
        `http://localhost:5000/api/payments/${payments[index]._id}`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPayments((prev) =>
        prev.map((payment, i) =>
          i === index ? { ...payment, status, updatedAt: new Date().toISOString() } : payment
        )
      );
    } catch (err) {
      setError('Failed to update payment status');
    } finally {
      setActionLoading(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <p>Loading payments...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Employee Dashboard - Payments</h2>
      <button onClick={logout} style={{ marginBottom: 20 }}>
        Logout
      </button>
      {payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', marginTop: 20 }}>
          <thead>
            <tr>
              <th>From Account</th>
              <th>To Account</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Provider</th>
              <th>SWIFT Code</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, index) => (
              <tr key={p._id || index}>
                <td>{p.fromAccount}</td>
                <td>{p.toAccount}</td>
                <td>{p.amount}</td>
                <td>{p.currency}</td>
                <td>{p.provider}</td>
                <td>{p.swiftCode}</td>
                <td>{p.status}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
                <td>
                  {p.status === 'Pending' ? (
                    <>
                      <button disabled={actionLoading === index} onClick={() => handleAction(index, 'Approved')}>
                        Approve
                      </button>
                      <button
                        disabled={actionLoading === index}
                        onClick={() => handleAction(index, 'Rejected')}
                        style={{ marginLeft: 8 }}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <em>{p.status}</em>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
