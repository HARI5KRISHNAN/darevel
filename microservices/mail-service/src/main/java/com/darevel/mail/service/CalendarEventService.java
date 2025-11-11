package com.darevel.mail.service;

import com.darevel.mail.dto.CalendarEventDTO;
import com.darevel.mail.dto.CreateCalendarEventRequest;
import com.darevel.mail.entity.CalendarEvent;
import com.darevel.mail.repository.CalendarEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
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
public class CalendarEventService {

    private final CalendarEventRepository eventRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public Page<CalendarEventDTO> getAllEvents(Jwt jwt, int page, int size) {
        String userId = jwt.getClaim("email");
        Pageable pageable = PageRequest.of(page, size);
        Page<CalendarEvent> events = eventRepository.findByUserIdAndIsCancelledFalseOrderByStartTimeAsc(userId, pageable);
        return events.map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public List<CalendarEventDTO> getEventsByDateRange(Jwt jwt, LocalDateTime startDate, LocalDateTime endDate) {
        String userId = jwt.getClaim("email");
        List<CalendarEvent> events = eventRepository.findEventsByDateRange(userId, startDate, endDate);
        return events.stream().map(this::mapToDTO).toList();
    }

    @Transactional(readOnly = true)
    public CalendarEventDTO getEventById(Jwt jwt, Long eventId) {
        String userId = jwt.getClaim("email");
        CalendarEvent event = eventRepository.findByIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Calendar event not found"));
        return mapToDTO(event);
    }

    @Transactional
    public CalendarEventDTO createEvent(Jwt jwt, CreateCalendarEventRequest request) {
        String userId = jwt.getClaim("email");

        CalendarEvent.CalendarEventBuilder eventBuilder = CalendarEvent.builder()
                .userId(userId)
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .allDay(request.getAllDay() != null ? request.getAllDay() : false)
                .color(request.getColor())
                .recurrenceRule(request.getRecurrenceRule())
                .reminderMinutes(request.getReminderMinutes())
                .isCancelled(false);

        // Handle attendees (JSON array)
        if (request.getAttendees() != null && !request.getAttendees().isEmpty()) {
            try {
                eventBuilder.attendees(objectMapper.writeValueAsString(request.getAttendees()));
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize attendees", e);
            }
        }

        CalendarEvent event = eventBuilder.build();
        event = eventRepository.save(event);

        return mapToDTO(event);
    }

    @Transactional
    public CalendarEventDTO updateEvent(Jwt jwt, Long eventId, CreateCalendarEventRequest request) {
        String userId = jwt.getClaim("email");
        CalendarEvent event = eventRepository.findByIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Calendar event not found"));

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setAllDay(request.getAllDay() != null ? request.getAllDay() : false);
        event.setColor(request.getColor());
        event.setRecurrenceRule(request.getRecurrenceRule());
        event.setReminderMinutes(request.getReminderMinutes());

        // Handle attendees
        if (request.getAttendees() != null) {
            try {
                event.setAttendees(objectMapper.writeValueAsString(request.getAttendees()));
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize attendees", e);
            }
        }

        event = eventRepository.save(event);
        return mapToDTO(event);
    }

    @Transactional
    public void cancelEvent(Jwt jwt, Long eventId) {
        String userId = jwt.getClaim("email");
        CalendarEvent event = eventRepository.findByIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Calendar event not found"));
        event.setIsCancelled(true);
        eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Jwt jwt, Long eventId) {
        String userId = jwt.getClaim("email");
        CalendarEvent event = eventRepository.findByIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Calendar event not found"));
        eventRepository.delete(event);
    }

    @Transactional(readOnly = true)
    public Page<CalendarEventDTO> searchEvents(Jwt jwt, String query, int page, int size) {
        String userId = jwt.getClaim("email");
        Pageable pageable = PageRequest.of(page, size);
        Page<CalendarEvent> events = eventRepository.searchEvents(userId, query, pageable);
        return events.map(this::mapToDTO);
    }

    private CalendarEventDTO mapToDTO(CalendarEvent event) {
        List<String> attendees = Collections.emptyList();
        if (event.getAttendees() != null) {
            try {
                attendees = objectMapper.readValue(event.getAttendees(), List.class);
            } catch (JsonProcessingException e) {
                log.error("Failed to deserialize attendees", e);
            }
        }

        return CalendarEventDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .allDay(event.getAllDay())
                .color(event.getColor())
                .attendees(attendees)
                .recurrenceRule(event.getRecurrenceRule())
                .reminderMinutes(event.getReminderMinutes())
                .isCancelled(event.getIsCancelled())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }
}
