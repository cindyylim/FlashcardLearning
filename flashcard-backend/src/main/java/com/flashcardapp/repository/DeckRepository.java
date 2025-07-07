package com.flashcardapp.repository;

import com.flashcardapp.model.Deck;
import com.flashcardapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeckRepository extends JpaRepository<Deck, Long> {
    List<Deck> findByUser(User user);
    Deck findByNameAndUser(String name, User user);
} 