import React, { useState } from 'react';
import { useAuth } from './AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, password);
      navigate('/decks');
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('username already exists')) {
        setError('That username is already taken. Please choose another.');
      } else {
        setError(err.message || 'Registration failed');
      }
    }
  };

  return (
    <div className="container">
      <div className="form">
        <h1>Create your account</h1>
        <p style={{ color: '#586380', marginBottom: '32px' }}>Start learning with flashcards</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="input"
              placeholder="Choose a username"
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
              placeholder="Create a password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }}>
            Create Account
          </button>
        </form>
        {error && <div className="message error">{error}</div>}
        <p style={{ textAlign: 'center', marginTop: '24px' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#3ccfcf', textDecoration: 'none', fontWeight: '600' }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage; 