import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from './api.ts';
import { useAuth } from './AuthContext.tsx';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  box: number;
  timesReviewed?: number;
  timesCorrect?: number;
}

const ReviewPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const fetchFlashcards = async () => {
    try {
      const data = await apiRequest(`/flashcards/deck/${deckId}`, {}, token!);
      setFlashcards(data.sort((a: Flashcard, b: Flashcard) => a.box - b.box));
      setCurrent(0);
      setDone(false);
      setCorrectCount(0);
      setIncorrectCount(0);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => { fetchFlashcards(); }, [deckId, token]);

  const handleReview = async (correct: boolean) => {
    const fc = flashcards[current];
    try {
      const updatedFlashcard = await apiRequest(`/progress/review/${fc.id}?correct=${correct}`, { method: 'PATCH' }, token!);
      
      // Update the local flashcards array with the updated flashcard data
      // Don't re-sort during the session to keep current index valid
      setFlashcards(prev => prev.map(card => 
        card.id === fc.id 
          ? { ...card, box: updatedFlashcard.box, timesReviewed: updatedFlashcard.timesReviewed, timesCorrect: updatedFlashcard.timesCorrect }
          : card
      ));
      
      if (correct) setCorrectCount(c => c + 1);
      else setIncorrectCount(c => c + 1);
      
      if (current + 1 < flashcards.length) {
        setCurrent(current + 1);
        setShowAnswer(false);
      } else {
        setDone(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) return (
    <div className="container">
      <div className="message error">{error}</div>
    </div>
  );

  if (done) return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center' }}>
        <h1>Review Complete!</h1>
        <div style={{ fontSize: '18px', marginBottom: '24px' }}>
          <div>Correct: <strong style={{ color: '#3ccfcf' }}>{correctCount}</strong></div>
          <div>Incorrect: <strong style={{ color: '#ff6b6b' }}>{incorrectCount}</strong></div>
          <div>Accuracy: <strong style={{ color: '#2d3748' }}>
            {flashcards.length ? Math.round((correctCount / flashcards.length) * 100) : 0}%
          </strong></div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => fetchFlashcards()} className="btn">
            Review Again
          </button>
          <button onClick={() => navigate('/decks')} className="btn btn-secondary">
            Back to Decks
          </button>
        </div>
      </div>
    </div>
  );

  if (!flashcards.length) return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center', color: '#586380' }}>
        <h3>No flashcards to review</h3>
        <p>Add some flashcards to your deck first!</p>
        <button onClick={() => navigate(`/decks/${deckId}/flashcards`)} className="btn">
          Add Flashcards
        </button>
      </div>
    </div>
  );

  const fc = flashcards[current];

  return (
    <div>
      <div className="header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Review Session</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: '#586380' }}>
                {current + 1} of {flashcards.length}
              </span>
              <button onClick={() => navigate('/decks')} className="btn btn-secondary">
                Exit Review
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="flashcard" style={{ minHeight: '300px', margin: '40px 0' }}>
          <div className="flashcard-question">{fc.question}</div>
          {showAnswer && (
            <div className="flashcard-answer">{fc.answer}</div>
          )}
        </div>

        <div className="review-controls">
          {!showAnswer ? (
            <button 
              onClick={() => setShowAnswer(true)} 
              className="btn"
              style={{ fontSize: '18px', padding: '16px 32px' }}
            >
              Show Answer
            </button>
          ) : (
            <>
              <button 
                onClick={() => handleReview(false)} 
                className="btn btn-danger"
                style={{ fontSize: '18px', padding: '16px 32px' }}
              >
                Incorrect
              </button>
              <button 
                onClick={() => handleReview(true)} 
                className="btn"
                style={{ fontSize: '18px', padding: '16px 32px' }}
              >
                Correct
              </button>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', color: '#586380' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
            <span>Correct: <strong style={{ color: '#3ccfcf' }}>{correctCount}</strong></span>
            <span>Incorrect: <strong style={{ color: '#ff6b6b' }}>{incorrectCount}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage; 