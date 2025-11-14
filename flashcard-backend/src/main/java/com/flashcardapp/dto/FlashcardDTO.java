package com.flashcardapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class FlashcardDTO {
    private Long id;
    private String question;
    private int timesReviewed;
    private int timesCorrect;
    private int box;
}
