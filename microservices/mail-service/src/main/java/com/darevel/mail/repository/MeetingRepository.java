package com.darevel.mail.repository;

import com.darevel.mail.entity.Meeting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    Optional<Meeting> findByIdAndOrganizerId(Long id, String organizerId);

    Page<Meeting> findByOrganizerIdAndStatusNotOrderByStartTimeDesc(String organizerId, String status, Pageable pageable);

    @Query("SELECT m FROM Meeting m WHERE m.organizerId = :userId " +
           "AND m.status = :status " +
           "ORDER BY m.startTime DESC")
    Page<Meeting> findMeetingsByStatus(
        @Param("userId") String userId,
        @Param("status") String status,
        Pageable pageable
    );

    @Query("SELECT m FROM Meeting m WHERE m.organizerId = :userId " +
           "AND m.startTime >= :startDate " +
           "AND m.endTime <= :endDate " +
           "ORDER BY m.startTime ASC")
    List<Meeting> findMeetingsByDateRange(
        @Param("userId") String userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT m FROM Meeting m WHERE m.organizerId = :userId " +
           "AND m.startTime <= :now " +
           "AND m.endTime >= :now " +
           "AND m.status = 'scheduled'")
    List<Meeting> findCurrentMeetings(
        @Param("userId") String userId,
        @Param("now") LocalDateTime now
    );

    @Query("SELECT m FROM Meeting m WHERE m.organizerId = :userId " +
           "AND (LOWER(m.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(m.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Meeting> searchMeetings(
        @Param("userId") String userId,
        @Param("query") String query,
        Pageable pageable
    );

    @Query("SELECT COUNT(m) FROM Meeting m WHERE m.organizerId = :userId " +
           "AND m.status = 'scheduled' " +
           "AND m.startTime > :now")
    Long countUpcomingMeetings(@Param("userId") String userId, @Param("now") LocalDateTime now);
}
