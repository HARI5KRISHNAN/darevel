package com.darevel.chat.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for WebRTC ICE Candidate
 * Used in ice-candidate signaling messages
 */
public class IceCandidateDto {
    private String candidate;
    
    @JsonProperty("sdpMLineIndex")
    private Integer sdpMLineIndex;
    
    @JsonProperty("sdpMid")
    private String sdpMid;
    
    @JsonProperty("usernameFragment")
    private String usernameFragment;

    public IceCandidateDto() {
    }

    public IceCandidateDto(String candidate, Integer sdpMLineIndex, String sdpMid, String usernameFragment) {
        this.candidate = candidate;
        this.sdpMLineIndex = sdpMLineIndex;
        this.sdpMid = sdpMid;
        this.usernameFragment = usernameFragment;
    }

    public String getCandidate() {
        return candidate;
    }

    public void setCandidate(String candidate) {
        this.candidate = candidate;
    }

    public Integer getSdpMLineIndex() {
        return sdpMLineIndex;
    }

    public void setSdpMLineIndex(Integer sdpMLineIndex) {
        this.sdpMLineIndex = sdpMLineIndex;
    }

    public String getSdpMid() {
        return sdpMid;
    }

    public void setSdpMid(String sdpMid) {
        this.sdpMid = sdpMid;
    }

    public String getUsernameFragment() {
        return usernameFragment;
    }

    public void setUsernameFragment(String usernameFragment) {
        this.usernameFragment = usernameFragment;
    }
}
