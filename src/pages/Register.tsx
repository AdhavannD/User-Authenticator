import React, { useState } from 'react';
import API from '../services/api';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await API.post('/register', form);
      setMessage(`User created: ${res.data.name} (${res.data.email})`);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Error creating user');
    }
  };

  return (
    <div className="form-card">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <input name="name" placeholder="Name" onChange={handleChange} required autoFocus />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
        <input name="password" placeholder="Password" type="password" onChange={handleChange} required minLength={6} />
        <button type="submit">Sign Up</button>
      </form>
      <p style={{ color: message.startsWith('User created') ? '#388e3c' : undefined }}>{message}</p>
    </div>
  );
};

export default Register;
