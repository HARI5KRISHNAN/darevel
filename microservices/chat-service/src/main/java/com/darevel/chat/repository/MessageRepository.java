package com.darevel.chat.repository;

import com.darevel.chat.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Get conversation between two users
    @Query("SELECT m FROM Message m WHERE " +
           "((m.senderId = :userId1 AND m.receiverId = :userId2) OR " +
           "(m.senderId = :userId2 AND m.receiverId = :userId1)) " +
           "AND m.isDeleted = false ORDER BY m.createdAt DESC")
    Page<Message> findConversation(String userId1, String userId2, Pageable pageable);

    // Get unread count for a user
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :userId AND m.isRead = false AND m.isDeleted = false")
    Long countUnreadByReceiverId(String userId);
}
