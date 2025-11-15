import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingQ, setEditingQ] = useState('');
  const [editingA, setEditingA] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFlashcards = async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const data = await apiRequest(`/flashcards/deck/${deckId}`, {}, token);

      if (!Array.isArray(data)) {
        setError('Failed to load flashcards.');
        setFlashcards([]);
      } else {
        setFlashcards(data);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [deckId, token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await apiRequest(
        `/flashcards/deck/${deckId}`,
        {
          method: 'POST',
          body: JSON.stringify({ question, answer }),
        },
        token!
      );

      setQuestion('');
      setAnswer('');
      fetchFlashcards();

    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    setError('');
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
    if (!editingId) return;

    setError('');

    try {
      await apiRequest(
        `/flashcards/${editingId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ question: editingQ, answer: editingA }),
        },
        token!
      );

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
      {/* Header */}
      <div className="header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Flashcards</h1>
          <button onClick={() => navigate('/decks')} className="btn btn-secondary">
            Back to Decks
          </button>
        </div>
      </div>

      <div className="container">

        {/* Create Flashcard */}
        <div className="card">
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Add New Flashcard</h2>

          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="question">Question</label>
              <input
                id="question"
                type="text"
                className="input"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="answer">Answer</label>
              <input
                id="answer"
                type="text"
                className="input"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn">Add Flashcard</button>
          </form>
        </div>

        {/* Error message */}
        {error && <div className="message error">{error}</div>}

        {/* Loading */}
        {loading && <div className="card">Loading flashcards...</div>}

        {/* Flashcards Grid */}
        {!loading && (
          <div className="grid">
            {flashcards.map(fc => (
              <div key={fc.id} className="card">

                {editingId === fc.id ? (
                  <form onSubmit={handleEditSubmit}>
                    <div className="form-group">
                      <label>Question</label>
                      <input
                        className="input"
                        value={editingQ}
                        onChange={e => setEditingQ(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Answer</label>
                      <input
                        className="input"
                        value={editingA}
                        onChange={e => setEditingA(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="submit" className="btn">Save</button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flashcard">
                      <div className="flashcard-question">{fc.question}</div>
                      <div className="flashcard-answer">{fc.answer}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleEdit(fc)} className="btn btn-secondary">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(fc.id)} className="btn btn-danger">
                        Delete
                      </button>
                    </div>
                  </>
                )}

              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && flashcards.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: '#586380' }}>
            <h3>No flashcards yet</h3>
            <p>Add your first flashcard to get started!</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default FlashcardsPage;
