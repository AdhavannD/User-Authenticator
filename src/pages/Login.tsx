import React, { useState } from 'react';
import API from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  token: string;
}

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<{ name: string; email: string; access_token: string } | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post('/login', form);
      setUser({ name: res.data.name, email: res.data.email, access_token: res.data.access_token });
      setMessage('');
      localStorage.setItem('access_token', res.data.access_token);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Login failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsers(null);
    localStorage.removeItem('access_token');
    setMessage('');
  };

  const handleSeeUsers = async () => {
    if (!user) return;
    setLoadingUsers(true);
    setMessage('');
    try {
      const res = await API.get('/users', {
        headers: { Authorization: `Bearer ${user.access_token}` },
      });
      setUsers(res.data);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Could not fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <div className="form-card">
      <h2>Login</h2>
      {user ? (
        <div style={{ textAlign: 'center', color: '#388e3c', fontSize: '1.2rem', fontWeight: 600 }}>
          Welcome, {user.name}!<br />
          <br />
          <button style={{ marginTop: '1.5rem', background: '#1976d2' }} onClick={handleSeeUsers} disabled={loadingUsers}>
            {loadingUsers ? 'Loading...' : 'See Other Users'}
          </button>
          <button style={{ marginTop: '1.5rem', marginLeft: '1rem', background: '#d32f2f' }} onClick={handleLogout}>Logout</button>
          {users && (
            <div style={{ marginTop: '2rem', textAlign: 'left' }}>
              <h3 style={{ color: '#1976d2' }}>Registered Users</h3>
              <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
                {users.map(u => (
                  <li key={u.id} style={{ marginBottom: '1.2rem', background: '#f5f7fa', borderRadius: 8, padding: '1rem' }}>
                    <strong>{u.name}</strong> <br />
                    <span style={{ color: '#555' }}>{u.email}</span> <br />
                    <span style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}><b>Token:</b> {u.token}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} autoComplete="off">
            <input name="email" placeholder="Email" type="email" onChange={handleChange} required autoFocus />
            <input name="password" placeholder="Password" type="password" onChange={handleChange} required minLength={6} />
            <button type="submit">Login</button>
          </form>
          <p style={{ color: '#d32f2f' }}>{message}</p>
        </>
      )}
      {message && !user && <p style={{ color: '#d32f2f' }}>{message}</p>}
    </div>
  );
};

export default Login;
