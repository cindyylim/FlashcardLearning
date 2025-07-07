package com.flashcardapp.controller;

import com.flashcardapp.model.Deck;
import com.flashcardapp.model.User;
import com.flashcardapp.repository.DeckRepository;
import com.flashcardapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.net.URLDecoder;
import java.io.UnsupportedEncodingException;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/decks")
public class DeckController {
    @Autowired
    private DeckRepository deckRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Deck> getDecks(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return deckRepository.findByUser(user);
    }

    @GetMapping("/id-from-name")
    public ResponseEntity<?> getDeckIdFromName(@RequestParam String name, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        try {
            String decoded = URLDecoder.decode(name, "UTF-8");
            Deck deck = deckRepository.findByNameAndUser(decoded, user);

            if (deck == null) {
                throw new RuntimeException("Deck not found");
            }
            return ResponseEntity.ok(deck.getId());
        } catch (UnsupportedEncodingException e) {
            System.err.println("Unsupported encoding: " + e.getMessage());
        }
        return ResponseEntity.status(404).body("Deck not found");
    }

    @PostMapping
    public Deck createDeck(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Deck deck) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        deck.setUser(user);
        return deckRepository.save(deck);
    }

    @PutMapping("/{id}")
    public Deck updateDeck(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails, @RequestBody Deck deckRequest) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Deck deck = deckRepository.findById(id).orElseThrow();
        if (!deck.getUser().getId().equals(user.getId())) throw new RuntimeException("Unauthorized");
        deck.setName(deckRequest.getName());
        return deckRepository.save(deck);
    }

    @DeleteMapping("/{id}")
    public void deleteDeck(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Deck deck = deckRepository.findById(id).orElseThrow();
        if (!deck.getUser().getId().equals(user.getId())) throw new RuntimeException("Unauthorized");
        deckRepository.delete(deck);
    }
} 