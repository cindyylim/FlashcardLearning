import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './AuthContext.tsx';
import LoginPage from './LoginPage.tsx';
import RegisterPage from './RegisterPage.tsx';
import DecksPage from './DecksPage.tsx';
import FlashcardsPage from './FlashcardsPage.tsx';
import ReviewPage from './ReviewPage.tsx';
import ImportExportPage from './ImportExportPage.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <nav className="nav">
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/decks">My Decks</Link></li>
              <li><Link to="/import-export">Import/Export</Link></li>
            </ul>
          </nav>
          <div className="container">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/decks" element={<ProtectedRoute><DecksPage /></ProtectedRoute>} />
              <Route path="/decks/:deckId/flashcards" element={<ProtectedRoute><FlashcardsPage /></ProtectedRoute>} />
              <Route path="/review/:deckId" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
              <Route path="/import-export" element={<ProtectedRoute><ImportExportPage /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
