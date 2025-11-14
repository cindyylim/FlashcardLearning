package com.flashcardapp.dto;

// Used when creating or updating a deck
public record DeckRequestDTO(
        String name,
        Long userId  // link deck to a user
) {}
