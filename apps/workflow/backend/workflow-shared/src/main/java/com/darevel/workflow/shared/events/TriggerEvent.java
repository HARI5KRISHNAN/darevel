package com.darevel.workflow.shared.events;

import com.darevel.workflow.shared.enums.TriggerType;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import lombok.Builder;
import lombok.Value;

@Value
@Builder(toBuilder = true)
public class TriggerEvent {
    UUID id;
    TriggerType type;
    String source;
    Map<String, Object> payload;
    Instant receivedAt;
    String tenantId;
}
