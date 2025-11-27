package com.darevel.mail.repository;

import com.darevel.mail.model.Mail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MailRepository extends JpaRepository<Mail, Long> {

    @Query(value = "SELECT * FROM mails WHERE (owner = :owner OR to_addresses LIKE '%' || :userEmail || '%') AND folder NOT IN ('SPAM', 'TRASH') ORDER BY created_at DESC LIMIT 200", nativeQuery = true)
    List<Mail> findInboxByOwnerOrRecipient(@Param("owner") String owner, @Param("userEmail") String userEmail);

    @Query(value = "SELECT * FROM mails WHERE owner = :owner AND folder = 'SENT' ORDER BY created_at DESC LIMIT 200", nativeQuery = true)
    List<Mail> findSentByOwner(@Param("owner") String owner);

    @Query(value = "SELECT * FROM mails WHERE (owner = :owner OR to_addresses LIKE '%' || :userEmail || '%') AND folder = 'SPAM' ORDER BY created_at DESC LIMIT 200", nativeQuery = true)
    List<Mail> findSpamByOwnerOrRecipient(@Param("owner") String owner, @Param("userEmail") String userEmail);

    @Query(value = "SELECT * FROM mails WHERE (owner = :owner OR to_addresses LIKE '%' || :userEmail || '%') AND folder = 'TRASH' ORDER BY created_at DESC LIMIT 200", nativeQuery = true)
    List<Mail> findTrashByOwnerOrRecipient(@Param("owner") String owner, @Param("userEmail") String userEmail);

    @Query(value = "SELECT * FROM mails WHERE (owner = :owner OR to_addresses LIKE '%' || :userEmail || '%') AND is_starred = true ORDER BY created_at DESC LIMIT 200", nativeQuery = true)
    List<Mail> findImportantByOwnerOrRecipient(@Param("owner") String owner, @Param("userEmail") String userEmail);

    @Query(value = "SELECT * FROM mails WHERE (owner = :owner OR to_addresses LIKE '%' || :owner || '%') AND (subject ILIKE '%' || :query || '%' OR body_text ILIKE '%' || :query || '%') ORDER BY created_at DESC LIMIT 200", nativeQuery = true)
    List<Mail> searchMails(@Param("owner") String owner, @Param("query") String query);

    @Query(value = """
        SELECT
            COUNT(*) FILTER (WHERE folder = 'INBOX' AND is_read = false) as inbox_unread,
            COUNT(*) FILTER (WHERE folder = 'SENT' AND is_read = false) as sent_unread,
            COUNT(*) FILTER (WHERE is_starred = true AND is_read = false) as important_unread,
            COUNT(*) FILTER (WHERE folder = 'SPAM') as spam_count,
            COUNT(*) FILTER (WHERE folder = 'TRASH') as trash_count
        FROM mails
        WHERE owner = :owner OR to_addresses LIKE '%' || :userEmail || '%'
        """, nativeQuery = true)
    Object[] getMailCounts(@Param("owner") String owner, @Param("userEmail") String userEmail);

    @Query(value = "SELECT * FROM mails WHERE id IN (:ids) AND (owner = :owner OR to_addresses LIKE '%' || :userEmail || '%')", nativeQuery = true)
    List<Mail> findByIdsAndOwnerOrRecipient(@Param("ids") List<Long> ids, @Param("owner") String owner, @Param("userEmail") String userEmail);
}
