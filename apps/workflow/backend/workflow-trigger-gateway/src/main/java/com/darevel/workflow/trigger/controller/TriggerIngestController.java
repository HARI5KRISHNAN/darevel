package com.darevel.workflow.trigger.controller;

import com.darevel.workflow.shared.events.TriggerEvent;
import com.darevel.workflow.trigger.service.TriggerPublisher;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/triggers")
public class TriggerIngestController {

    private final TriggerPublisher publisher;

    public TriggerIngestController(TriggerPublisher publisher) {
        this.publisher = publisher;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public TriggerEvent ingest(@Valid @RequestBody TriggerRequest request) {
        TriggerEvent event = TriggerEvent.builder()
                .type(request.type())
                .source(request.source())
                .payload(request.payload())
                .tenantId(request.tenantId())
                .build();
        return publisher.publish(event);
    }

    public record TriggerRequest(@NotNull com.darevel.workflow.shared.enums.TriggerType type,
                                 @NotBlank String source,
                                 Map<String, Object> payload,
                                 String tenantId) {}
}
