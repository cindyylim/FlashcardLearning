package com.flashcardapp.controller;

import com.flashcardapp.model.Deck;
import com.flashcardapp.model.Flashcard;
import com.flashcardapp.model.User;
import com.flashcardapp.repository.DeckRepository;
import com.flashcardapp.repository.FlashcardRepository;
import com.flashcardapp.repository.UserRepository;
import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.opencsv.exceptions.CsvValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/csv")
public class DeckCsvController {
    @Autowired
    private DeckRepository deckRepository;
    @Autowired
    private FlashcardRepository flashcardRepository;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/import")
    public Deck importDeck(@RequestParam("file") MultipartFile file, @RequestParam("deckName") String deckName, @AuthenticationPrincipal UserDetails userDetails) throws IOException, CsvValidationException {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Deck deck = new Deck();
        deck.setName(deckName);
        deck.setUser(user);
        deck = deckRepository.save(deck);
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String[] line;
            while ((line = reader.readNext()) != null) {
                if (line.length < 2) continue;
                Flashcard flashcard = new Flashcard();
                flashcard.setQuestion(line[0]);
                flashcard.setAnswer(line[1]);
                flashcard.setDeck(deck);
                flashcardRepository.save(flashcard);
            }
        }
        return deck;
    }

    @GetMapping("/export/{deckId}")
    public ResponseEntity<byte[]> exportDeck(@PathVariable Long deckId, @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Deck deck = deckRepository.findById(deckId).orElseThrow();
        if (!deck.getUser().getId().equals(user.getId())) throw new RuntimeException("Unauthorized");
        List<Flashcard> flashcards = new ArrayList<>(deck.getFlashcards());
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {
            for (Flashcard flashcard : flashcards) {
                writer.writeNext(new String[]{flashcard.getQuestion(), flashcard.getAnswer()});
            }
        }
        byte[] csvBytes = baos.toByteArray();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=deck-" + deckId + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
} 