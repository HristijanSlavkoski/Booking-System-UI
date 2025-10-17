package com.vrroom.controller;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AuthController {

  private final WebClient webClient;

  @Value("${keycloak.auth-server-url}")
  private String authServerUrl;

  @Value("${keycloak.realm}")
  private String realm;

  @Value("${keycloak.client-id}")
  private String clientId;

  @Value("${keycloak.client-secret}")
  private String clientSecret;

  public record LoginRequest(String email, String password) {}

  @PostMapping("/login")
  public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest creds) {
    MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
    form.add("grant_type", "password");
    form.add("client_id", clientId);
    // If client auth is ON (confidential), send the secret. If OFF (public), comment the next line.
    form.add("client_secret", clientSecret);
    form.add("username", creds.email());
    form.add("password", creds.password());
    // optional but harmless:
    form.add("scope", "openid");

    String tokenUrl = authServerUrl + "/realms/" + realm + "/protocol/openid-connect/token";

    Map<String, Object> tokens = webClient.post()
            .uri(tokenUrl)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(BodyInserters.fromFormData(form))
            .exchangeToMono(resp -> {
              if (resp.statusCode().is2xxSuccessful()) {
                return resp.bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
              }
              // Read the error body for debugging
              return resp.bodyToMono(String.class).flatMap(body -> {
                System.err.println("Keycloak token error " + resp.statusCode() + ": " + body);
                return reactor.core.publisher.Mono.error(
                        new IllegalStateException("Keycloak token error " + resp.statusCode() + ": " + body)
                );
              });
            })
            .block();

    return ResponseEntity.ok(tokens);
  }
}
