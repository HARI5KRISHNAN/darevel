package com.darevel.chat.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for WebRTC ICE Candidate
 * Used in ice-candidate signaling messages
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IceCandidateDto {
    private String candidate;
    
    @JsonProperty("sdpMLineIndex")
    private Integer sdpMLineIndex;
    
    @JsonProperty("sdpMid")
    private String sdpMid;
    
    @JsonProperty("usernameFragment")
    private String usernameFragment;
}
