package com.flashcardapp.mapper;

import com.flashcardapp.dto.DeckResponseDTO;
import com.flashcardapp.dto.FlashcardResponseDTO;
import com.flashcardapp.model.Deck;
import com.flashcardapp.model.Flashcard;

import java.util.List;
import java.util.stream.Collectors;

public class DeckMapper {
    
    public static DeckResponseDTO toDTO(Deck deck) {
        List<FlashcardResponseDTO> flashcardDTOs = deck.getFlashcards().stream()
                .map(DeckMapper::toFlashcardDTO)
                .collect(Collectors.toList());
        
        return new DeckResponseDTO(
                deck.getId(),
                deck.getName(),
                flashcardDTOs
        );
    }
    
    private static FlashcardResponseDTO toFlashcardDTO(Flashcard flashcard) {
        return new FlashcardResponseDTO(
                flashcard.getId(),
                flashcard.getQuestion(),
                flashcard.getAnswer(),
                flashcard.getBox(),
                flashcard.getTimesReviewed(),
                flashcard.getTimesCorrect()
        );
    }
}

