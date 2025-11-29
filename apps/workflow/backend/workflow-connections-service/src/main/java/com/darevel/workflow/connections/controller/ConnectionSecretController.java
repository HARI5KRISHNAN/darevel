package com.darevel.workflow.connections.controller;

import com.darevel.workflow.connections.entity.ConnectionSecretEntity;
import com.darevel.workflow.connections.service.ConnectionSecretService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class ConnectionSecretController {

    private final ConnectionSecretService service;

    @GetMapping
    public List<ConnectionSecretEntity> list(@RequestParam(required = false) String tenantId) {
        return service.list(tenantId);
    }

    @GetMapping("/{id}")
    public ConnectionSecretEntity get(@PathVariable UUID id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ConnectionSecretEntity create(@RequestBody @Valid ConnectionRequest request) {
        return service.create(request.tenantId(), request.provider(), request.displayName(), request.secret());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    public record ConnectionRequest(@NotBlank String tenantId,
                                    @NotBlank String provider,
                                    @NotBlank String displayName,
                                    Map<String, Object> secret) {}
}
