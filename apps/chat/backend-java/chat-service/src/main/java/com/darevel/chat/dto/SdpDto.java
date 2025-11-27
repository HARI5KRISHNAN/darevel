package com.darevel.chat.dto;

/**
 * DTO for WebRTC Session Description Protocol (SDP)
 * Used in offer and answer messages
 */
public class SdpDto {
    private String type; // "offer" or "answer"
    private String sdp;  // SDP string

    public SdpDto() {
    }

    public SdpDto(String type, String sdp) {
        this.type = type;
        this.sdp = sdp;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSdp() {
        return sdp;
    }

    public void setSdp(String sdp) {
        this.sdp = sdp;
    }
}
