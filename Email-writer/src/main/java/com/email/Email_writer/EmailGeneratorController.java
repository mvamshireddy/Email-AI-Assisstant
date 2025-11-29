package com.email.Email_writer;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/email")
@CrossOrigin(origins = "*")
public class EmailGeneratorController {

    private EmailGeneratorService emailGeneratorService;
    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest) {
        String response = emailGeneratorService.generatorEmailReply( emailRequest);
        return ResponseEntity.ok(response);
    }
}
