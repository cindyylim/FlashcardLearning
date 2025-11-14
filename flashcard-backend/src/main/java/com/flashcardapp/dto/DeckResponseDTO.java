package com.flashcardapp.dto;

import java.util.List;

// Used to return deck info
public record DeckResponseDTO(
        Long id,
        String name,
        List<FlashcardResponseDTO> flashcards
) {}
