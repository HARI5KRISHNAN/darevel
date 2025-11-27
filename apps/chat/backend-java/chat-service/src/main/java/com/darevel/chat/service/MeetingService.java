package com.darevel.chat.service;

import com.darevel.chat.dto.MeetingDTO;
import com.darevel.chat.entity.Meeting;
import com.darevel.chat.entity.Meeting.MeetingStatus;
import com.darevel.chat.repository.MeetingRepository;
import com.darevel.chat.util.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    private static final Logger log = LoggerFactory.getLogger(MeetingService.class);

    private final MeetingRepository meetingRepository;
    private final UserService userService;

    @org.springframework.beans.factory.annotation.Value("${jitsi.base-url:http://localhost:8000}")
    private String jitsiBaseUrl;

    public MeetingService(MeetingRepository meetingRepository, UserService userService) {
        this.meetingRepository = meetingRepository;
        this.userService = userService;
    }

    /**
     * Create a new meeting
     */
    @Transactional
    public MeetingDTO createMeeting(MeetingDTO dto) {
        // Extract organizer info from JWT token if not provided
        Long organizerId = dto.getOrganizerId();
        String organizerEmail = dto.getOrganizerEmail();
        String organizerName = dto.getOrganizerName();
        
        // Try to get organizer ID from JWT token
        if (organizerId == null) {
            organizerId = JwtUtils.getCurrentUserId();
            log.info("Attempted to extract organizer ID from JWT: {}", organizerId);
        }
        
        // Get email from JWT (Keycloak always provides this)
        if (organizerEmail == null) {
            organizerEmail = JwtUtils.getCurrentUserEmail();
            log.info("Extracted organizer email from JWT: {}", organizerEmail);
        }
        
        if (organizerName == null) {
            organizerName = JwtUtils.getCurrentUserName();
            log.info("Extracted organizer name from JWT: {}", organizerName);
        }
        
        // If we still don't have a numeric ID but have an email, look it up or create via auth service
        if (organizerId == null && organizerEmail != null) {
            log.info("No numeric user_id in JWT, looking up or creating by email: {}", organizerEmail);
            // First try simple lookup
            organizerId = userService.getUserIdByEmail(organizerEmail);

            // If not found, try find-or-create (for Keycloak SSO users)
            if (organizerId == null) {
                log.info("User not found, attempting find-or-create for: {}", organizerEmail);
                organizerId = userService.findOrCreateUserByEmail(organizerEmail, organizerName);
            }

            if (organizerId != null) {
                log.info("Found/created organizer ID from email lookup: {}", organizerId);
            }
        }

        // Final check - we must have an organizer ID
        if (organizerId == null) {
            throw new IllegalArgumentException("Unable to determine organizer. Please ensure you are authenticated and the auth service is running on port 8086.");
        }
        
        // Convert participant emails to IDs if emails provided
        List<Long> participantIds = dto.getParticipantIds();
        if ((participantIds == null || participantIds.isEmpty()) && 
            dto.getParticipantEmails() != null && !dto.getParticipantEmails().isEmpty()) {
            log.info("Converting {} participant emails to user IDs", dto.getParticipantEmails().size());
            participantIds = userService.convertEmailsToUserIds(dto.getParticipantEmails());
            log.info("Converted to {} participant IDs", participantIds.size());
        }
        
        // Generate room name if not provided
        String roomName = dto.getRoomName();
        if (roomName == null || roomName.isEmpty()) {
            roomName = generateRoomName();
        }

        // Generate meeting link using self-hosted Jitsi
        String meetingLink = dto.getMeetingLink();
        if (meetingLink == null || meetingLink.isEmpty()) {
            meetingLink = jitsiBaseUrl + "/" + roomName;
        }

        Meeting meeting = new Meeting();
        meeting.setTitle(dto.getTitle());
        meeting.setDescription(dto.getDescription());
        meeting.setStartTime(dto.getStartTime());
        meeting.setEndTime(dto.getEndTime());
        meeting.setLocation(dto.getLocation());
        meeting.setMeetingLink(meetingLink);
        meeting.setRoomName(roomName);
        meeting.setOrganizerId(organizerId);
        meeting.setOrganizerName(organizerName);
        meeting.setOrganizerEmail(organizerEmail);
        meeting.setParticipantIds(participantIds);
        meeting.setStatus(MeetingStatus.SCHEDULED);

        Meeting saved = meetingRepository.save(meeting);
        log.info("Created meeting: {} with room {} for organizer {}", saved.getId(), roomName, organizerId);

        return toDTO(saved);
    }

    /**
     * Get meeting by ID
     */
    public Optional<MeetingDTO> getMeetingById(Long id) {
        return meetingRepository.findById(id).map(this::toDTO);
    }

    /**
     * Get all meetings for a user (as organizer or participant)
     */
    public List<MeetingDTO> getMeetingsForUser(Long userId) {
        return meetingRepository.findAllMeetingsForUser(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get upcoming meetings for a user
     */
    public List<MeetingDTO> getUpcomingMeetingsForUser(Long userId) {
        return meetingRepository.findUpcomingMeetingsForUser(userId, LocalDateTime.now())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get meetings within a date range
     */
    public List<MeetingDTO> getMeetingsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return meetingRepository.findMeetingsBetweenDates(startDate, endDate)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update a meeting
     */
    @Transactional
    public Optional<MeetingDTO> updateMeeting(Long id, MeetingDTO dto) {
        return meetingRepository.findById(id).map(meeting -> {
            if (dto.getTitle() != null) meeting.setTitle(dto.getTitle());
            if (dto.getDescription() != null) meeting.setDescription(dto.getDescription());
            if (dto.getStartTime() != null) meeting.setStartTime(dto.getStartTime());
            if (dto.getEndTime() != null) meeting.setEndTime(dto.getEndTime());
            if (dto.getLocation() != null) meeting.setLocation(dto.getLocation());
            if (dto.getMeetingLink() != null) meeting.setMeetingLink(dto.getMeetingLink());
            if (dto.getParticipantIds() != null) meeting.setParticipantIds(dto.getParticipantIds());
            if (dto.getStatus() != null) meeting.setStatus(dto.getStatus());

            Meeting saved = meetingRepository.save(meeting);
            log.info("Updated meeting: {}", saved.getId());
            return toDTO(saved);
        });
    }

    /**
     * Update meeting status
     */
    @Transactional
    public Optional<MeetingDTO> updateMeetingStatus(Long id, MeetingStatus status) {
        return meetingRepository.findById(id).map(meeting -> {
            meeting.setStatus(status);
            Meeting saved = meetingRepository.save(meeting);
            log.info("Updated meeting {} status to {}", id, status);
            return toDTO(saved);
        });
    }

    /**
     * Cancel a meeting
     */
    @Transactional
    public Optional<MeetingDTO> cancelMeeting(Long id) {
        return updateMeetingStatus(id, MeetingStatus.CANCELLED);
    }

    /**
     * Delete a meeting
     */
    @Transactional
    public boolean deleteMeeting(Long id) {
        if (meetingRepository.existsById(id)) {
            meetingRepository.deleteById(id);
            log.info("Deleted meeting: {}", id);
            return true;
        }
        return false;
    }

    /**
     * Get meeting by room name
     */
    public Optional<MeetingDTO> getMeetingByRoomName(String roomName) {
        Meeting meeting = meetingRepository.findByRoomName(roomName);
        return Optional.ofNullable(meeting).map(this::toDTO);
    }

    /**
     * Count upcoming meetings for a user
     */
    public Long countUpcomingMeetings(Long userId) {
        return meetingRepository.countUpcomingMeetingsForUser(userId, LocalDateTime.now());
    }

    /**
     * Check for conflicting meetings for a user
     */
    public List<MeetingDTO> checkConflicts(Long userId, LocalDateTime startTime, LocalDateTime endTime) {
        return meetingRepository.findConflictingMeetings(userId, startTime, endTime)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Check for conflicting meetings excluding a specific meeting (for updates)
     */
    public List<MeetingDTO> checkConflictsExcluding(Long userId, LocalDateTime startTime, LocalDateTime endTime, Long excludeMeetingId) {
        return meetingRepository.findConflictingMeetingsExcluding(userId, startTime, endTime, excludeMeetingId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Check if any participants have conflicts
     */
    public java.util.Map<Long, List<MeetingDTO>> checkParticipantConflicts(List<Long> participantIds, LocalDateTime startTime, LocalDateTime endTime) {
        java.util.Map<Long, List<MeetingDTO>> conflicts = new java.util.HashMap<>();
        for (Long participantId : participantIds) {
            List<MeetingDTO> participantConflicts = checkConflicts(participantId, startTime, endTime);
            if (!participantConflicts.isEmpty()) {
                conflicts.put(participantId, participantConflicts);
            }
        }
        return conflicts;
    }

    /**
     * Generate a unique room name
     */
    private String generateRoomName() {
        String timestamp = Long.toString(System.currentTimeMillis(), 36);
        String random = UUID.randomUUID().toString().substring(0, 8);
        return "whooper-" + timestamp + "-" + random;
    }

    /**
     * Convert entity to DTO
     */
    private MeetingDTO toDTO(Meeting meeting) {
        MeetingDTO dto = new MeetingDTO();
        dto.setId(meeting.getId());
        dto.setTitle(meeting.getTitle());
        dto.setDescription(meeting.getDescription());
        dto.setStartTime(meeting.getStartTime());
        dto.setEndTime(meeting.getEndTime());
        dto.setLocation(meeting.getLocation());
        dto.setMeetingLink(meeting.getMeetingLink());
        dto.setRoomName(meeting.getRoomName());
        dto.setOrganizerId(meeting.getOrganizerId());
        dto.setOrganizerName(meeting.getOrganizerName());
        dto.setOrganizerEmail(meeting.getOrganizerEmail());
        dto.setParticipantIds(meeting.getParticipantIds());
        dto.setStatus(meeting.getStatus());
        dto.setCreatedAt(meeting.getCreatedAt());
        dto.setUpdatedAt(meeting.getUpdatedAt());
        return dto;
    }
}
