import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiRequest } from './api.ts';
import { useAuth } from './AuthContext.tsx';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  timesReviewed: number;
  timesCorrect: number;
  box: number;
}

const ReviewPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const { token } = useAuth();
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
      await apiRequest(`/progress/review/${fc.id}?correct=${correct}`, { method: 'POST' }, token!);
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

  if (error) return <div style={{color: 'red'}}>{error}</div>;
  if (done) return (
    <div>
      <div>Review session complete!</div>
      <div>Correct: {correctCount} | Incorrect: {incorrectCount} | Percent Correct: {flashcards.length ? Math.round((correctCount / flashcards.length) * 100) : 0}%</div>
    </div>
  );
  if (!flashcards.length) return <div>No flashcards to review.</div>;

  const fc = flashcards[current];

  return (
    <div>
      <h2>Review</h2>
      <div>
        <strong>Q:</strong> {fc.question}
      </div>
      {showAnswer ? (
        <div>
          <strong>A:</strong> {fc.answer}
        </div>
      ) : (
        <button onClick={() => setShowAnswer(true)}>Show Answer</button>
      )}
      {showAnswer && (
        <div>
          <button onClick={() => handleReview(true)}>I was correct</button>
          <button onClick={() => handleReview(false)}>I was wrong</button>
        </div>
      )}
      <div>Card {current + 1} of {flashcards.length}</div>
      <div style={{marginTop: 10}}>
        <strong>Session Progress:</strong> Correct: {correctCount} | Incorrect: {incorrectCount} | Percent Correct: {flashcards.length ? Math.round((correctCount / (current + 1)) * 100) : 0}%
      </div>
    </div>
  );
};

export default ReviewPage; 