package com.flashcardapp.controller;

import com.flashcardapp.dto.FlashcardRequest;
import com.flashcardapp.model.Deck;
import com.flashcardapp.model.Flashcard;
import com.flashcardapp.model.User;
import com.flashcardapp.repository.DeckRepository;
import com.flashcardapp.repository.FlashcardRepository;
import com.flashcardapp.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    // ------------------- GET FLASHCARDS -------------------
    @GetMapping("/deck/{deckId}")
    public List<Flashcard> getFlashcards(@PathVariable Long deckId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserOrThrow(userDetails);
        Deck deck = getDeckOrThrow(deckId);
        checkDeckOwnership(deck, user);
        return flashcardRepository.findByDeck(deck);
    }

    // ------------------- CREATE FLASHCARD -------------------
    @PostMapping("/deck/{deckId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Flashcard createFlashcard(
            @PathVariable Long deckId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody FlashcardRequest flashcardRequest
    ) {
        User user = getUserOrThrow(userDetails);
        Deck deck = getDeckOrThrow(deckId);
        checkDeckOwnership(deck, user);

        Flashcard flashcard = new Flashcard();
        flashcard.setDeck(deck);
        flashcard.setQuestion(flashcardRequest.getQuestion().trim());
        flashcard.setAnswer(flashcardRequest.getAnswer().trim());

        return flashcardRepository.save(flashcard);
    }

    // ------------------- UPDATE FLASHCARD -------------------
    @PutMapping("/{id}")
    public Flashcard updateFlashcard(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody FlashcardRequest flashcardRequest
    ) {
        Flashcard flashcard = flashcardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Flashcard not found"));
        User user = getUserOrThrow(userDetails);
        checkDeckOwnership(flashcard.getDeck(), user);

        flashcard.setQuestion(flashcardRequest.getQuestion().trim());
        flashcard.setAnswer(flashcardRequest.getAnswer().trim());
        return flashcardRepository.save(flashcard);
    }

    // ------------------- DELETE FLASHCARD -------------------
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFlashcard(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Flashcard flashcard = flashcardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Flashcard not found"));
        User user = getUserOrThrow(userDetails);
        checkDeckOwnership(flashcard.getDeck(), user);
        flashcardRepository.delete(flashcard);
    }

    // ------------------- HELPER METHODS -------------------
    private User getUserOrThrow(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Deck getDeckOrThrow(Long deckId) {
        return deckRepository.findById(deckId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deck not found"));
    }

    private void checkDeckOwnership(Deck deck, User user) {
        if (!deck.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
        }
    }
}
