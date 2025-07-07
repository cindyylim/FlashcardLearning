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

  useEffect(() => { fetchDecks(); }, [token]);

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
      <h2>Decks</h2>
      <button onClick={handleLogout}>Logout</button>
      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New deck name"
          value={newDeck}
          onChange={e => setNewDeck(e.target.value)}
          required
        />
        <button type="submit">Create Deck</button>
      </form>
      {error && <div style={{color: 'red'}}>{error}</div>}
      <ul>
        {decks.map(deck => (
          <li key={deck.id}>
            {editingId === deck.id ? (
              <form onSubmit={handleEditSubmit} style={{ display: 'inline' }}>
                <input value={editingName} onChange={e => setEditingName(e.target.value)} required />
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
              </form>
            ) : (
              <>
                {deck.name}
                <button onClick={() => handleEdit(deck)}>Edit</button>
                <button onClick={() => handleDelete(deck.id)}>Delete</button>
                <button onClick={() => navigate(`/decks/${deck.id}/flashcards`)}>Add/View Cards</button>
                <button onClick={() => navigate(`/review/${deck.id}`)}>Review</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DecksPage; 