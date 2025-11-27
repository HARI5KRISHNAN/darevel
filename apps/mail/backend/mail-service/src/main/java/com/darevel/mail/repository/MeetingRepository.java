package com.darevel.mail.repository;

import com.darevel.mail.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    List<Meeting> findByOrganizerEmailOrderByScheduledAtDesc(String organizerEmail);

    Optional<Meeting> findByIdAndOrganizerEmail(Long id, String organizerEmail);

    void deleteByIdAndOrganizerEmail(Long id, String organizerEmail);
}
