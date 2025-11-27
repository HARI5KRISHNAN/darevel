package com.darevel.chat.repository;

import com.darevel.chat.entity.Meeting;
import com.darevel.chat.entity.Meeting.MeetingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    // Find meetings by organizer
    List<Meeting> findByOrganizerIdOrderByStartTimeDesc(Long organizerId);

    // Find meetings where user is participant
    @Query("SELECT m FROM Meeting m JOIN m.participantIds p WHERE p = :userId ORDER BY m.startTime DESC")
    List<Meeting> findByParticipantId(@Param("userId") Long userId);

    // Find upcoming meetings for a user (organizer or participant)
    @Query("SELECT DISTINCT m FROM Meeting m LEFT JOIN m.participantIds p " +
           "WHERE (m.organizerId = :userId OR p = :userId) " +
           "AND m.startTime > :now AND m.status = 'SCHEDULED' " +
           "ORDER BY m.startTime ASC")
    List<Meeting> findUpcomingMeetingsForUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    // Find all meetings for a user (organizer or participant)
    @Query("SELECT DISTINCT m FROM Meeting m LEFT JOIN m.participantIds p " +
           "WHERE m.organizerId = :userId OR p = :userId " +
           "ORDER BY m.startTime DESC")
    List<Meeting> findAllMeetingsForUser(@Param("userId") Long userId);

    // Find meetings by status
    List<Meeting> findByStatusOrderByStartTimeDesc(MeetingStatus status);

    // Find meetings within a date range
    @Query("SELECT m FROM Meeting m WHERE m.startTime >= :startDate AND m.startTime <= :endDate ORDER BY m.startTime ASC")
    List<Meeting> findMeetingsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Find meetings by room name
    Meeting findByRoomName(String roomName);

    // Count upcoming meetings for a user
    @Query("SELECT COUNT(DISTINCT m) FROM Meeting m LEFT JOIN m.participantIds p " +
           "WHERE (m.organizerId = :userId OR p = :userId) " +
           "AND m.startTime > :now AND m.status = 'SCHEDULED'")
    Long countUpcomingMeetingsForUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    // Find conflicting meetings for a user (overlapping time slots)
    @Query("SELECT DISTINCT m FROM Meeting m LEFT JOIN m.participantIds p " +
           "WHERE (m.organizerId = :userId OR p = :userId) " +
           "AND m.status = 'SCHEDULED' " +
           "AND ((m.startTime <= :startTime AND m.endTime > :startTime) " +
           "OR (m.startTime < :endTime AND m.endTime >= :endTime) " +
           "OR (m.startTime >= :startTime AND m.endTime <= :endTime))")
    List<Meeting> findConflictingMeetings(@Param("userId") Long userId,
                                          @Param("startTime") LocalDateTime startTime,
                                          @Param("endTime") LocalDateTime endTime);

    // Find conflicting meetings for a user excluding a specific meeting (for updates)
    @Query("SELECT DISTINCT m FROM Meeting m LEFT JOIN m.participantIds p " +
           "WHERE (m.organizerId = :userId OR p = :userId) " +
           "AND m.status = 'SCHEDULED' " +
           "AND m.id != :excludeMeetingId " +
           "AND ((m.startTime <= :startTime AND m.endTime > :startTime) " +
           "OR (m.startTime < :endTime AND m.endTime >= :endTime) " +
           "OR (m.startTime >= :startTime AND m.endTime <= :endTime))")
    List<Meeting> findConflictingMeetingsExcluding(@Param("userId") Long userId,
                                                    @Param("startTime") LocalDateTime startTime,
                                                    @Param("endTime") LocalDateTime endTime,
                                                    @Param("excludeMeetingId") Long excludeMeetingId);
}
