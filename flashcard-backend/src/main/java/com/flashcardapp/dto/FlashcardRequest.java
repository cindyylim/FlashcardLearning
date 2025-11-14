package com.flashcardapp.dto;

import jakarta.validation.constraints.NotBlank;

public class FlashcardRequest {

    @NotBlank(message = "Question cannot be blank")
    private String question;

    @NotBlank(message = "Answer cannot be blank")
    private String answer;

    // Getters and setters
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
}
