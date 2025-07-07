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

function App() {
  return (
    <AuthProvider>
      <Router>
        <nav>
          <ul>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/decks">Decks</Link></li>
            <li><Link to="/import-export">Import/Export</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/decks" element={<DecksPage />} />
          <Route path="/decks/:deckId/flashcards" element={<FlashcardsPage />} />
          <Route path="/review/:deckId" element={<ReviewPage />} />
          <Route path="/import-export" element={<ImportExportPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
