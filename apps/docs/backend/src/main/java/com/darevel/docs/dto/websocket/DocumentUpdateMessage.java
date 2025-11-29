package com.darevel.docs.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentUpdateMessage {

    private String type; // "update", "cursor", "selection", "awareness"
    private String userId;
    private String userName;
    private String sessionId;
    private Map<String, Object> payload;
    private Long timestamp;
}
