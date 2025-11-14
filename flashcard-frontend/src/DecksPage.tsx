import React, { useEffect, useState } from 'react';
import { apiRequest } from './api.ts';
import { useAuth } from './AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface Deck {
  id: number;
  name: string;
}

const DecksPage: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [newDeck, setNewDeck] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const fetchDecks = async () => {
    try {
      const data = await apiRequest('/decks', {}, token!);
      setDecks(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDecks();
  }, [token, navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiRequest('/decks', {
        method: 'POST',
        body: JSON.stringify({ name: newDeck }),
      }, token!);
      setNewDeck('');
      fetchDecks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiRequest(`/decks/${id}`, { method: 'DELETE' }, token!);
      fetchDecks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (deck: Deck) => {
    setEditingId(deck.id);
    setEditingName(deck.name);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId == null) return;
    try {
      await apiRequest(`/decks/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editingName }),
      }, token!);
      setEditingId(null);
      setEditingName('');
      fetchDecks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <div className="header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>My Decks</h1>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Create New Deck</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              className="input"
              placeholder="Enter deck name"
              value={newDeck}
              onChange={e => setNewDeck(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn">
              Create Deck
            </button>
          </form>
        </div>

        {error && <div className="message error">{error}</div>}

        <div className="grid">
          {decks.map(deck => (
            <div key={deck.id} className="card">
              {editingId === deck.id ? (
                <form onSubmit={handleEditSubmit}>
                  <input
                    className="input"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    required
                    style={{ marginBottom: '12px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="btn">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3 style={{ marginTop: 0, marginBottom: '16px' }}>{deck.name}</h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => handleEdit(deck)} className="btn btn-secondary">
                      Edit
                    </button>
                    <button onClick={() => navigate(`/decks/${deck.id}/flashcards`)} className="btn">
                      Add Cards
                    </button>
                    <button onClick={() => navigate(`/review/${deck.id}`)} className="btn">
                      Review
                    </button>
                    <button onClick={() => handleDelete(deck.id)} className="btn btn-danger">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {decks.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: '#586380' }}>
            <h3>No decks yet</h3>
            <p>Create your first deck to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecksPage; 