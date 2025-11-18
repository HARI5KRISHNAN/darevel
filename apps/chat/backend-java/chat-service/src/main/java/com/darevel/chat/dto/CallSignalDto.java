package com.darevel.chat.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for WebRTC call signaling messages
 * Used for audio/video call offer, answer, ICE candidates, etc.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CallSignalDto {
    
    private String type; // call-offer, call-answer, ice-candidate, call-rejected, call-ended
    private Long from;   // Caller user ID
    private Long to;     // Receiver user ID
    private String channelId; // Direct message channel ID
    
    @JsonProperty("callType")
    private String callType; // audio or video
    
    // WebRTC offer
    private SdpDto offer;
    
    // WebRTC answer
    private SdpDto answer;
    
    // ICE candidate
    private IceCandidateDto candidate;
}
