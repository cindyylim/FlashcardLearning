package com.flashcardapp.controller;

import com.flashcardapp.dto.FlashcardDTO;
import com.flashcardapp.model.Flashcard;
import com.flashcardapp.repository.FlashcardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/progress")
public class SpacedRepetitionController {

    @Autowired
    private FlashcardRepository flashcardRepository;

    @PatchMapping("/review/{flashcardId}")
    @Transactional
    public FlashcardDTO reviewFlashcard(
            @PathVariable Long flashcardId,
            @RequestParam boolean correct,
            @AuthenticationPrincipal UserDetails userDetails) {

        Flashcard flashcard = flashcardRepository.findById(flashcardId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Flashcard not found"));

        // Verify ownership - @Transactional ensures lazy loading works
        if (!flashcard.getDeck().getUser().getUsername().equals(userDetails.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot review this flashcard");
        }

        // Apply SRS review logic
        flashcard.review(correct);

        // Save and convert to DTO
        Flashcard updatedFlashcard = flashcardRepository.save(flashcard);

        return new FlashcardDTO(
                updatedFlashcard.getId(),
                updatedFlashcard.getQuestion(),
                updatedFlashcard.getTimesReviewed(),
                updatedFlashcard.getTimesCorrect(),
                updatedFlashcard.getBox()
        );
    }
}
