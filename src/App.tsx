import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import './App.css';

function Nav() {
  const location = useLocation();
  return (
    <nav>
      <Link to="/register" style={{ fontWeight: location.pathname === '/register' ? 700 : 500 }}>
        Register
      </Link>
      |
      <Link to="/login" style={{ fontWeight: location.pathname === '/login' ? 700 : 500 }}>
        Login
      </Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
