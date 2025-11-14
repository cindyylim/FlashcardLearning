package com.flashcardapp.controller;

import com.flashcardapp.dto.AuthResponse;
import com.flashcardapp.dto.LoginRequest;
import com.flashcardapp.dto.RegisterRequest;
import com.flashcardapp.dto.RefreshTokenRequest;
import com.flashcardapp.model.User;
import com.flashcardapp.repository.UserRepository;
import com.flashcardapp.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (repo.findByUsername(req.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(encoder.encode(req.getPassword()));
        repo.save(user);

        return ResponseEntity.ok("User registered");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );

        String access = jwtService.generateAccessToken(req.getUsername());
        String refresh = jwtService.generateRefreshToken(req.getUsername());

        return ResponseEntity.ok(
                new AuthResponse(access, refresh, jwtService.getExpiration())
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshTokenRequest req) {
        if (!jwtService.isTokenValid(req.getRefreshToken())) {
            return ResponseEntity.status(401).body("Invalid refresh token");
        }

        String username = jwtService.extractUsername(req.getRefreshToken());
        String newAccessToken = jwtService.generateAccessToken(username);

        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }
}
