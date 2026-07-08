package com.goluxtrip.backend.controller;

import com.goluxtrip.backend.model.ApplicationRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "https://goluxtrip-drab.vercel.app"})
public class ApplyController {

    private final JavaMailSender mailSender;

    @Value("${email.to}")
    private String emailTo;

    @Value("${spring.mail.username}")
    private String emailFrom;

    public ApplyController(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Boolean>> health() {
        return ResponseEntity.ok(Collections.singletonMap("ok", true));
    }

    @PostMapping("/apply")
    public ResponseEntity<Map<String, String>> apply(@Valid @RequestBody ApplicationRequest request) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("GoLuxTrip Landing <" + emailFrom + ">");
            message.setTo(emailTo);
            message.setReplyTo(request.getEmail());
            message.setSubject("New GoLuxTrip request - " + request.getCar());

            String text = String.join("\n",
                    "New GoLuxTrip application",
                    "",
                    "Name: " + request.getName(),
                    "Email: " + request.getEmail(),
                    "Phone: " + request.getPhone(),
                    "Selected car: " + request.getCar(),
                    "Dates: " + request.getDates(),
                    "Route / plan: " + request.getRoute(),
                    "",
                    "Message:",
                    request.getMessage() == null || request.getMessage().isEmpty() ? "-" : request.getMessage()
            );

            message.setText(text);
            mailSender.send(message);

            return ResponseEntity.ok(Collections.singletonMap("message", "Application sent."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Collections.singletonMap("message", "Email could not be sent right now."));
        }
    }
}
