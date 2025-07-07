import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiRequest } from './api.ts';
import { useAuth } from './AuthContext.tsx';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

const FlashcardsPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const { token } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingQ, setEditingQ] = useState('');
  const [editingA, setEditingA] = useState('');

  const fetchFlashcards = async () => {
    try {
      const data = await apiRequest(`/flashcards/deck/${deckId}`, {}, token!);
      if (!Array.isArray(data)) {
        setError('Failed to load flashcards.');
        setFlashcards([]);
      } else {
        setFlashcards(data);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => { fetchFlashcards(); }, [deckId, token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiRequest(`/flashcards/deck/${deckId}`, {
        method: 'POST',
        body: JSON.stringify({ question, answer }),
      }, token!);
      await fetchFlashcards(); // ensure the list is refreshed before clearing
      setQuestion('');
      setAnswer('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiRequest(`/flashcards/${id}`, { method: 'DELETE' }, token!);
      fetchFlashcards();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (fc: Flashcard) => {
    setEditingId(fc.id);
    setEditingQ(fc.question);
    setEditingA(fc.answer);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId == null) return;
    try {
      await apiRequest(`/flashcards/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({ question: editingQ, answer: editingA }),
      }, token!);
      setEditingId(null);
      setEditingQ('');
      setEditingA('');
      fetchFlashcards();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Flashcards</h2>
      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Answer"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          required
        />
        <button type="submit">Add Flashcard</button>
      </form>
      {error && <div style={{color: 'red'}}>{error}</div>}
      <ul>
        {flashcards.map(fc => (
          <li key={fc.id}>
            {editingId === fc.id ? (
              <form onSubmit={handleEditSubmit} style={{ display: 'inline' }}>
                <input value={editingQ} onChange={e => setEditingQ(e.target.value)} required />
                <input value={editingA} onChange={e => setEditingA(e.target.value)} required />
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
              </form>
            ) : (
              <>
                Q: {fc.question} <br />A: {fc.answer}
                <button onClick={() => handleEdit(fc)}>Edit</button>
                <button onClick={() => handleDelete(fc.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FlashcardsPage; 