package com.flashcardapp.controller;

import com.flashcardapp.dto.DeckRequestDTO;
import com.flashcardapp.dto.DeckResponseDTO;
import com.flashcardapp.mapper.DeckMapper;
import com.flashcardapp.model.Deck;
import com.flashcardapp.model.User;
import com.flashcardapp.repository.DeckRepository;
import com.flashcardapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/decks")
public class DeckController {

    @Autowired
    private DeckRepository deckRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper method to get authenticated user
    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // GET /api/decks
    @GetMapping
    public List<DeckResponseDTO> getDecks(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        return deckRepository.findByUser(user)
                .stream()
                .map(DeckMapper::toDTO)
                .collect(Collectors.toList());
    }

    // GET /api/decks/id-from-name?name=deckName
    @GetMapping("/id-from-name")
    public ResponseEntity<?> getDeckIdFromName(@RequestParam String name,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        Deck deck = deckRepository.findByNameAndUser(name, user);
        if (deck == null) {
            return ResponseEntity.status(404).body("Deck not found");
        }
        return ResponseEntity.ok(deck.getId());
    }

    // POST /api/decks
    @PostMapping
    public ResponseEntity<DeckResponseDTO> createDeck(@AuthenticationPrincipal UserDetails userDetails,
                                                      @RequestBody DeckRequestDTO deckRequest) {
        User user = getCurrentUser(userDetails);
        Deck deck = new Deck();
        deck.setName(deckRequest.name());
        deck.setUser(user);
        Deck savedDeck = deckRepository.save(deck);
        return ResponseEntity.ok(DeckMapper.toDTO(savedDeck));
    }

    // PUT /api/decks/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDeck(@PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails userDetails,
                                        @RequestBody DeckRequestDTO deckRequest) {
        User user = getCurrentUser(userDetails);
        Deck deck = deckRepository.findById(id).orElse(null);
        if (deck == null) return ResponseEntity.status(404).body("Deck not found");
        if (!deck.getUser().getId().equals(user.getId())) return ResponseEntity.status(403).body("Unauthorized");

        deck.setName(deckRequest.name());
        Deck updatedDeck = deckRepository.save(deck);
        return ResponseEntity.ok(DeckMapper.toDTO(updatedDeck));
    }

    // DELETE /api/decks/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDeck(@PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        Deck deck = deckRepository.findById(id).orElse(null);
        if (deck == null) return ResponseEntity.status(404).body("Deck not found");
        if (!deck.getUser().getId().equals(user.getId())) return ResponseEntity.status(403).body("Unauthorized");

        deckRepository.delete(deck);
        return ResponseEntity.ok("Deck deleted successfully");
    }
}
