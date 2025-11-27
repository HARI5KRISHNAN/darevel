package com.darevel.mail.service;

import com.darevel.mail.dto.MeetingDTO;
import com.darevel.mail.model.Meeting;
import com.darevel.mail.repository.MeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CalendarService {

    @Autowired
    private MeetingRepository meetingRepository;

    @Transactional(readOnly = true)
    public List<MeetingDTO> getMeetings(String organizerEmail) {
        return meetingRepository.findByOrganizerEmailOrderByScheduledAtDesc(organizerEmail)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<MeetingDTO> getMeetingById(Long id, String organizerEmail) {
        return meetingRepository.findByIdAndOrganizerEmail(id, organizerEmail)
                .map(this::convertToDTO);
    }

    @Transactional
    public MeetingDTO createMeeting(String organizerEmail, String title, String description,
                                     LocalDateTime scheduledAt, Integer duration, String roomName) {
        Meeting meeting = new Meeting();
        meeting.setTitle(title);
        meeting.setDescription(description);
        meeting.setScheduledAt(scheduledAt);
        meeting.setDuration(duration != null ? duration : 60);
        meeting.setRoomName(roomName);
        meeting.setOrganizerEmail(organizerEmail);
        meeting.setStatus("scheduled");

        return convertToDTO(meetingRepository.save(meeting));
    }

    @Transactional
    public Optional<MeetingDTO> updateMeeting(Long id, String organizerEmail, String title, String description,
                                               LocalDateTime scheduledAt, Integer duration, String status, String recordingUrl) {
        return meetingRepository.findByIdAndOrganizerEmail(id, organizerEmail)
                .map(meeting -> {
                    if (title != null) meeting.setTitle(title);
                    if (description != null) meeting.setDescription(description);
                    if (scheduledAt != null) meeting.setScheduledAt(scheduledAt);
                    if (duration != null) meeting.setDuration(duration);
                    if (status != null) meeting.setStatus(status);
                    if (recordingUrl != null) meeting.setRecordingUrl(recordingUrl);
                    return convertToDTO(meetingRepository.save(meeting));
                });
    }

    @Transactional
    public boolean deleteMeeting(Long id, String organizerEmail) {
        return meetingRepository.findByIdAndOrganizerEmail(id, organizerEmail)
                .map(meeting -> {
                    meetingRepository.delete(meeting);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public Optional<MeetingDTO> joinMeeting(Long id, String organizerEmail) {
        return meetingRepository.findByIdAndOrganizerEmail(id, organizerEmail)
                .map(meeting -> {
                    meeting.setStatus("in_progress");
                    return convertToDTO(meetingRepository.save(meeting));
                });
    }

    @Transactional
    public Optional<MeetingDTO> endMeeting(Long id, String organizerEmail) {
        return meetingRepository.findByIdAndOrganizerEmail(id, organizerEmail)
                .map(meeting -> {
                    meeting.setStatus("completed");
                    // Generate a simulated recording URL
                    String recordingUrl = "https://recordings.darevel.local/" + meeting.getRoomName() + "/" + UUID.randomUUID() + ".mp4";
                    meeting.setRecordingUrl(recordingUrl);
                    return convertToDTO(meetingRepository.save(meeting));
                });
    }

    @Transactional
    public Optional<MeetingDTO> updateRecording(Long id, String organizerEmail, String recordingUrl) {
        return meetingRepository.findByIdAndOrganizerEmail(id, organizerEmail)
                .map(meeting -> {
                    meeting.setRecordingUrl(recordingUrl);
                    return convertToDTO(meetingRepository.save(meeting));
                });
    }

    private MeetingDTO convertToDTO(Meeting meeting) {
        MeetingDTO dto = new MeetingDTO();
        dto.setId(meeting.getId());
        dto.setTitle(meeting.getTitle());
        dto.setDescription(meeting.getDescription());
        dto.setScheduledAt(meeting.getScheduledAt());
        dto.setDuration(meeting.getDuration());
        dto.setRoomName(meeting.getRoomName());
        dto.setOrganizerEmail(meeting.getOrganizerEmail());
        dto.setStatus(meeting.getStatus());
        dto.setRecordingUrl(meeting.getRecordingUrl());
        dto.setCreatedAt(meeting.getCreatedAt());
        dto.setUpdatedAt(meeting.getUpdatedAt());
        return dto;
    }
}
