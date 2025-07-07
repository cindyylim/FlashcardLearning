package com.flashcardapp.repository;

import com.flashcardapp.model.Flashcard;
import com.flashcardapp.model.Deck;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findByDeck(Deck deck);
} 