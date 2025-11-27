package com.darevel.chat.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for the Chat service
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, WebRequest request) {
        
        log.error("Data integrity violation: {}", ex.getMessage());
        
        String message = "Database constraint violation";
        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("organizer_id")) {
                message = "Meeting organizer is required. Please ensure you are authenticated.";
            } else if (ex.getMessage().contains("title")) {
                message = "Meeting title is required";
            } else if (ex.getMessage().contains("start_time")) {
                message = "Meeting start time is required";
            } else if (ex.getMessage().contains("end_time")) {
                message = "Meeting end time is required";
            }
        }
        
        return createErrorResponse(HttpStatus.BAD_REQUEST, message, request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(
            IllegalArgumentException ex, WebRequest request) {
        
        log.error("Illegal argument: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(
            ResourceNotFoundException ex, WebRequest request) {
        
        log.error("Resource not found: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(
            UnauthorizedException ex, WebRequest request) {
        
        log.error("Unauthorized access: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGlobalException(
            Exception ex, WebRequest request) {
        
        log.error("Unexpected error: ", ex);
        return createErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "An unexpected error occurred: " + ex.getMessage(),
            request
        );
    }

    private ResponseEntity<Map<String, Object>> createErrorResponse(
            HttpStatus status, String message, WebRequest request) {
        
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("timestamp", LocalDateTime.now().toString());
        errorDetails.put("status", status.value());
        errorDetails.put("error", status.getReasonPhrase());
        errorDetails.put("message", message);
        errorDetails.put("path", request.getDescription(false).replace("uri=", ""));
        
        return new ResponseEntity<>(errorDetails, status);
    }

    /**
     * Custom exception for resource not found
     */
    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }

    /**
     * Custom exception for unauthorized access
     */
    public static class UnauthorizedException extends RuntimeException {
        public UnauthorizedException(String message) {
            super(message);
        }
    }
}
