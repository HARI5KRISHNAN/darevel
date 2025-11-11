package com.darevel.mail.service;

import com.darevel.mail.dto.CreateMeetingRequest;
import com.darevel.mail.dto.MeetingDTO;
import com.darevel.mail.entity.Meeting;
import com.darevel.mail.repository.MeetingRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public Page<MeetingDTO> getAllMeetings(Jwt jwt, int page, int size) {
        String userId = jwt.getClaim("email");
        Pageable pageable = PageRequest.of(page, size);
        Page<Meeting> meetings = meetingRepository.findByOrganizerIdAndStatusNotOrderByStartTimeDesc(
                userId, "cancelled", pageable);
        return meetings.map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public Page<MeetingDTO> getMeetingsByStatus(Jwt jwt, String status, int page, int size) {
        String userId = jwt.getClaim("email");
        Pageable pageable = PageRequest.of(page, size);
        Page<Meeting> meetings = meetingRepository.findMeetingsByStatus(userId, status, pageable);
        return meetings.map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public List<MeetingDTO> getMeetingsByDateRange(Jwt jwt, LocalDateTime startDate, LocalDateTime endDate) {
        String userId = jwt.getClaim("email");
        List<Meeting> meetings = meetingRepository.findMeetingsByDateRange(userId, startDate, endDate);
        return meetings.stream().map(this::mapToDTO).toList();
    }

    @Transactional(readOnly = true)
    public MeetingDTO getMeetingById(Jwt jwt, Long meetingId) {
        String userId = jwt.getClaim("email");
        Meeting meeting = meetingRepository.findByIdAndOrganizerId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        return mapToDTO(meeting);
    }

    @Transactional
    public MeetingDTO createMeeting(Jwt jwt, CreateMeetingRequest request) {
        String userId = jwt.getClaim("email");
        String userEmail = jwt.getClaim("email");
        String userName = jwt.getClaim("name");

        Meeting.MeetingBuilder meetingBuilder = Meeting.builder()
                .organizerId(userId)
                .organizerEmail(userEmail)
                .organizerName(userName)
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .location(request.getLocation())
                .meetingLink(request.getMeetingLink())
                .agenda(request.getAgenda())
                .isRecurring(request.getIsRecurring() != null ? request.getIsRecurring() : false)
                .recurrenceRule(request.getRecurrenceRule())
                .reminderMinutes(request.getReminderMinutes())
                .status("scheduled");

        // Handle attendees (JSON array)
        if (request.getAttendees() != null && !request.getAttendees().isEmpty()) {
            try {
                meetingBuilder.attendees(objectMapper.writeValueAsString(request.getAttendees()));
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize attendees", e);
            }
        }

        Meeting meeting = meetingBuilder.build();
        meeting = meetingRepository.save(meeting);

        return mapToDTO(meeting);
    }

    @Transactional
    public MeetingDTO updateMeeting(Jwt jwt, Long meetingId, CreateMeetingRequest request) {
        String userId = jwt.getClaim("email");
        Meeting meeting = meetingRepository.findByIdAndOrganizerId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        meeting.setTitle(request.getTitle());
        meeting.setDescription(request.getDescription());
        meeting.setStartTime(request.getStartTime());
        meeting.setEndTime(request.getEndTime());
        meeting.setLocation(request.getLocation());
        meeting.setMeetingLink(request.getMeetingLink());
        meeting.setAgenda(request.getAgenda());
        meeting.setIsRecurring(request.getIsRecurring() != null ? request.getIsRecurring() : false);
        meeting.setRecurrenceRule(request.getRecurrenceRule());
        meeting.setReminderMinutes(request.getReminderMinutes());

        // Handle attendees
        if (request.getAttendees() != null) {
            try {
                meeting.setAttendees(objectMapper.writeValueAsString(request.getAttendees()));
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize attendees", e);
            }
        }

        meeting = meetingRepository.save(meeting);
        return mapToDTO(meeting);
    }

    @Transactional
    public MeetingDTO updateMeetingStatus(Jwt jwt, Long meetingId, String status) {
        String userId = jwt.getClaim("email");
        Meeting meeting = meetingRepository.findByIdAndOrganizerId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        meeting.setStatus(status);
        meeting = meetingRepository.save(meeting);
        return mapToDTO(meeting);
    }

    @Transactional
    public MeetingDTO updateMeetingNotes(Jwt jwt, Long meetingId, String notes) {
        String userId = jwt.getClaim("email");
        Meeting meeting = meetingRepository.findByIdAndOrganizerId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        meeting.setNotes(notes);
        meeting = meetingRepository.save(meeting);
        return mapToDTO(meeting);
    }

    @Transactional
    public void deleteMeeting(Jwt jwt, Long meetingId) {
        String userId = jwt.getClaim("email");
        Meeting meeting = meetingRepository.findByIdAndOrganizerId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        meetingRepository.delete(meeting);
    }

    @Transactional(readOnly = true)
    public Long getUpcomingMeetingsCount(Jwt jwt) {
        String userId = jwt.getClaim("email");
        return meetingRepository.countUpcomingMeetings(userId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public Page<MeetingDTO> searchMeetings(Jwt jwt, String query, int page, int size) {
        String userId = jwt.getClaim("email");
        Pageable pageable = PageRequest.of(page, size);
        Page<Meeting> meetings = meetingRepository.searchMeetings(userId, query, pageable);
        return meetings.map(this::mapToDTO);
    }

    private MeetingDTO mapToDTO(Meeting meeting) {
        List<MeetingDTO.AttendeeDTO> attendees = Collections.emptyList();
        if (meeting.getAttendees() != null) {
            try {
                attendees = objectMapper.readValue(meeting.getAttendees(),
                    new TypeReference<List<MeetingDTO.AttendeeDTO>>() {});
            } catch (JsonProcessingException e) {
                log.error("Failed to deserialize attendees", e);
            }
        }

        return MeetingDTO.builder()
                .id(meeting.getId())
                .organizerEmail(meeting.getOrganizerEmail())
                .organizerName(meeting.getOrganizerName())
                .title(meeting.getTitle())
                .description(meeting.getDescription())
                .startTime(meeting.getStartTime())
                .endTime(meeting.getEndTime())
                .location(meeting.getLocation())
                .meetingLink(meeting.getMeetingLink())
                .attendees(attendees)
                .agenda(meeting.getAgenda())
                .notes(meeting.getNotes())
                .status(meeting.getStatus())
                .isRecurring(meeting.getIsRecurring())
                .recurrenceRule(meeting.getRecurrenceRule())
                .reminderMinutes(meeting.getReminderMinutes())
                .createdAt(meeting.getCreatedAt())
                .updatedAt(meeting.getUpdatedAt())
                .build();
    }
}
