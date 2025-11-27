package com.darevel.chat.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for WebRTC call signaling messages
 * Used for audio/video call offer, answer, ICE candidates, etc.
 */
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

    public CallSignalDto() {
    }

    public CallSignalDto(String type, Long from, Long to, String channelId, String callType, SdpDto offer, SdpDto answer, IceCandidateDto candidate) {
        this.type = type;
        this.from = from;
        this.to = to;
        this.channelId = channelId;
        this.callType = callType;
        this.offer = offer;
        this.answer = answer;
        this.candidate = candidate;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getFrom() {
        return from;
    }

    public void setFrom(Long from) {
        this.from = from;
    }

    public Long getTo() {
        return to;
    }

    public void setTo(Long to) {
        this.to = to;
    }

    public String getChannelId() {
        return channelId;
    }

    public void setChannelId(String channelId) {
        this.channelId = channelId;
    }

    public String getCallType() {
        return callType;
    }

    public void setCallType(String callType) {
        this.callType = callType;
    }

    public SdpDto getOffer() {
        return offer;
    }

    public void setOffer(SdpDto offer) {
        this.offer = offer;
    }

    public SdpDto getAnswer() {
        return answer;
    }

    public void setAnswer(SdpDto answer) {
        this.answer = answer;
    }

    public IceCandidateDto getCandidate() {
        return candidate;
    }

    public void setCandidate(IceCandidateDto candidate) {
        this.candidate = candidate;
    }
}
