package com.flashcardapp.controller;

import com.flashcardapp.model.Flashcard;
import com.flashcardapp.repository.FlashcardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
public class SpacedRepetitionController {
    @Autowired
    private FlashcardRepository flashcardRepository;

    @PostMapping("/review/{flashcardId}")
    public Flashcard reviewFlashcard(@PathVariable Long flashcardId, @RequestParam boolean correct) {
        Flashcard flashcard = flashcardRepository.findById(flashcardId).orElseThrow();
        flashcard.setTimesReviewed(flashcard.getTimesReviewed() + 1);
        if (correct) {
            flashcard.setTimesCorrect(flashcard.getTimesCorrect() + 1);
            flashcard.setBox(Math.min(flashcard.getBox() + 1, 5)); // Max 5 boxes
        } else {
            flashcard.setBox(1); // Reset to box 1 on failure
        }
        return flashcardRepository.save(flashcard);
    }
} 