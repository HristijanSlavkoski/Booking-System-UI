package com.vrroom.controller;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Hristijan Slavkoski
 */
@RestController
@RequestMapping("/actuator")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class ActuatorController
{
    @GetMapping("/health")
    public ResponseEntity<?> getHealth()
    {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
