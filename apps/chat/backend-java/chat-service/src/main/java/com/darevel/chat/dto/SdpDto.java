package com.darevel.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for WebRTC Session Description Protocol (SDP)
 * Used in offer and answer messages
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SdpDto {
    private String type; // "offer" or "answer"
    private String sdp;  // SDP string
}
