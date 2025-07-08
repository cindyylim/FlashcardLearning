import React, { useState } from 'react';
import { useAuth } from './AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/decks');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="container">
      <div className="form">
        <h1>Welcome back</h1>
        <p style={{ color: '#586380', marginBottom: '32px' }}>Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="input"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }}>
            Sign In
          </button>
        </form>
        {error && <div className="message error">{error}</div>}
        <p style={{ textAlign: 'center', marginTop: '24px' }}>
          Don't have an account?{' '}
          <a href="/register" style={{ color: '#3ccfcf', textDecoration: 'none', fontWeight: '600' }}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 