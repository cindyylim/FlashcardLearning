package com.flashcardapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@EnableWebMvc
@SpringBootApplication
public class FlashcardBackendApplication {
    // Main entry point
    public static void main(String[] args) {
        SpringApplication.run(FlashcardBackendApplication.class, args);
    }
}
