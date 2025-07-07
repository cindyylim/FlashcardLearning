package com.flashcardapp.controller;

import com.flashcardapp.model.Deck;
import com.flashcardapp.model.Flashcard;
import com.flashcardapp.model.User;
import com.flashcardapp.repository.DeckRepository;
import com.flashcardapp.repository.FlashcardRepository;
import com.flashcardapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {
    @Autowired
    private FlashcardRepository flashcardRepository;
    @Autowired
    private DeckRepository deckRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/deck/{deckId}")
    public List<Flashcard> getFlashcards(@PathVariable Long deckId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Deck deck = deckRepository.findById(deckId).orElseThrow();
        if (!deck.getUser().getId().equals(user.getId())) throw new RuntimeException("Unauthorized");
        return flashcardRepository.findByDeck(deck);
    }

    @PostMapping("/deck/{deckId}")
    public Flashcard createFlashcard(@PathVariable Long deckId, @AuthenticationPrincipal UserDetails userDetails, @RequestBody Flashcard flashcard) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Deck deck = deckRepository.findById(deckId).orElseThrow();
        if (!deck.getUser().getId().equals(user.getId())) throw new RuntimeException("Unauthorized");
        flashcard.setDeck(deck);
        return flashcardRepository.save(flashcard);
    }

    @PutMapping("/{id}")
    public Flashcard updateFlashcard(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails, @RequestBody Flashcard flashcardRequest) {
        Flashcard flashcard = flashcardRepository.findById(id).orElseThrow();
        Deck deck = flashcard.getDeck();
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        if (!deck.getUser().getId().equals(user.getId())) throw new RuntimeException("Unauthorized");
        flashcard.setQuestion(flashcardRequest.getQuestion());
        flashcard.setAnswer(flashcardRequest.getAnswer());
        return flashcardRepository.save(flashcard);
    }

    @DeleteMapping("/{id}")
    public void deleteFlashcard(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Flashcard flashcard = flashcardRepository.findById(id).orElseThrow();
        Deck deck = flashcard.getDeck();
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        if (!deck.getUser().getId().equals(user.getId())) throw new RuntimeException("Unauthorized");
        flashcardRepository.delete(flashcard);
    }
} 