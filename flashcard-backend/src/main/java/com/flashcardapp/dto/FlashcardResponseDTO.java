package com.flashcardapp.dto;

// Used to return flashcard info
public record FlashcardResponseDTO(
        Long id,
        String question,
        String answer,
        int box,
        int timesReviewed,
        int timesCorrect
) {}

