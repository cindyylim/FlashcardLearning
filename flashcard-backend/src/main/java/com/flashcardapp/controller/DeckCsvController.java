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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@RestController 
@RequestMapping("/api/csv") 
public class DeckCsvController { 
    @Autowired private DeckRepository deckRepository; 
    @Autowired private FlashcardRepository flashcardRepository; 
    @Autowired private UserRepository userRepository;

    @PostMapping("/import")
    @Transactional
    public ResponseEntity<Deck> importDeck(
            @RequestParam("file") MultipartFile file,
            @RequestParam("deckName") String deckName,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException, CsvValidationException {

        // 1. Find authenticated user
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Create and save deck
        Deck deck = new Deck();
        deck.setName(deckName);
        deck.setUser(user);
        deck = deckRepository.save(deck);

        // 3. Read CSV
        List<Flashcard> flashcards = new ArrayList<>();
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String[] line;
            boolean isFirstLine = true;

            while ((line = reader.readNext()) != null) {
                // Skip empty lines
                if (line.length == 0 || (line.length == 1 && line[0].isBlank())) continue;

                // Skip header row if present
                if (isFirstLine && line[0].equalsIgnoreCase("question") && line[1].equalsIgnoreCase("answer")) {
                    isFirstLine = false;
                    continue;
                }
                isFirstLine = false;

                // Skip invalid rows
                if (line.length < 2 || line[0].isBlank() || line[1].isBlank()) continue;

                Flashcard flashcard = new Flashcard();
                flashcard.setQuestion(line[0].trim());
                flashcard.setAnswer(line[1].trim());
                flashcard.setDeck(deck);
                flashcards.add(flashcard);
            }
        }

        // 4. Save all flashcards in batch
        if (!flashcards.isEmpty()) {
            flashcardRepository.saveAll(flashcards);
        }

        return ResponseEntity.ok(deck);
    }
    
    @GetMapping("/export/{deckId}")
    public ResponseEntity<byte[]> exportDeck(
            @PathVariable Long deckId,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        // 1. Find authenticated user
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Retrieve the deck
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new RuntimeException("Deck not found"));

        // 3. Authorization check
        if (!deck.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        // 4. Generate CSV
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {
            // Write header
            writer.writeNext(new String[]{"Question", "Answer"});

            // Write each flashcard
            for (Flashcard flashcard : deck.getFlashcards()) {
                String question = flashcard.getQuestion() != null ? flashcard.getQuestion().trim() : "";
                String answer = flashcard.getAnswer() != null ? flashcard.getAnswer().trim() : "";
                writer.writeNext(new String[]{question, answer});
            }
        }

        byte[] csvBytes = baos.toByteArray();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=deck-" + deckId + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
    
    @GetMapping("/export/{deckId}/stream")
    public ResponseEntity<StreamingResponseBody> exportDeckStreaming(
            @PathVariable Long deckId,
            @AuthenticationPrincipal UserDetails userDetails) {

        // 1. Find authenticated user
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Retrieve the deck
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new RuntimeException("Deck not found"));

        // 3. Authorization check
        if (!deck.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        // 4. Prepare StreamingResponseBody
        StreamingResponseBody stream = outputStream -> {
            try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8))) {
                // Write header
                writer.writeNext(new String[]{"Question", "Answer"});

                // Stream each flashcard
                for (Flashcard flashcard : deck.getFlashcards()) {
                    String question = flashcard.getQuestion() != null ? flashcard.getQuestion().trim() : "";
                    String answer = flashcard.getAnswer() != null ? flashcard.getAnswer().trim() : "";
                    writer.writeNext(new String[]{question, answer});
                    writer.flush();
                }
            }
        };

        // 5. Return response
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=deck-" + deckId + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(stream);
    }

}
