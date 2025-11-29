package com.darevel.publiclink.service;

import com.darevel.publiclink.dto.FormPublicDTO;
import com.darevel.publiclink.dto.SubmissionDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class PublicFormService {

    private final WebClient.Builder webClientBuilder;

    @Value("${form-service.url}")
    private String formServiceUrl;

    @Value("${response-service.url}")
    private String responseServiceUrl;

    public Mono<FormPublicDTO> getPublicForm(String publicId) {
        log.info("Fetching public form: {}", publicId);
        
        return webClientBuilder.build()
                .get()
                .uri(formServiceUrl + "/api/forms/public/" + publicId)
                .retrieve()
                .bodyToMono(FormPublicDTO.class)
                .doOnError(e -> log.error("Error fetching form: {}", e.getMessage()));
    }

    public Mono<String> submitResponse(String publicId, SubmissionDTO submission, String ipAddress) {
        log.info("Submitting response for form: {}", publicId);
        
        return webClientBuilder.build()
                .post()
                .uri(responseServiceUrl + "/api/responses/public/" + publicId)
                .bodyValue(submission)
                .header("X-Forwarded-For", ipAddress)
                .retrieve()
                .bodyToMono(String.class)
                .doOnError(e -> log.error("Error submitting response: {}", e.getMessage()));
    }
}
