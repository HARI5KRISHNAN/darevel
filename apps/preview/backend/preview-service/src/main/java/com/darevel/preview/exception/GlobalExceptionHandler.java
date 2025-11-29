package com.darevel.preview.exception;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PreviewNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(PreviewNotFoundException ex) {
        return ResponseEntity.status(404).body(defaultBody(ex.getMessage()));
    }

    @ExceptionHandler({ProcessorNotFoundException.class, StorageException.class})
    public ResponseEntity<Map<String, Object>> handleProcessing(RuntimeException ex) {
        return ResponseEntity.status(502).body(defaultBody(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> body = defaultBody("Validation failed");
        body.put("details", ex.getBindingResult().getFieldErrors());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleFallback(Exception ex) {
        return ResponseEntity.status(500).body(defaultBody("Unexpected error"));
    }

    private Map<String, Object> defaultBody(String message) {
        Map<String, Object> map = new HashMap<>();
        map.put("timestamp", Instant.now());
        map.put("message", message);
        return map;
    }
}
