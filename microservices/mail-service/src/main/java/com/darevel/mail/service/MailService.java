package com.darevel.mail.service;

import com.darevel.mail.dto.ComposeEmailRequest;
import com.darevel.mail.dto.EmailDTO;
import com.darevel.mail.entity.Email;
import com.darevel.mail.repository.EmailRepository;
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
public class MailService {

    private final EmailRepository emailRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Get inbox emails (received)
     */
    @Transactional(readOnly = true)
    public Page<EmailDTO> getInbox(Jwt jwt, int page, int size) {
        String userEmail = jwt.getClaim("email");
        Pageable pageable = PageRequest.of(page, size);
        Page<Email> emails = emailRepository.findByUserIdAndFolderAndIsDeletedFalseOrderByCreatedAtDesc(
                userEmail, "inbox", pageable);
        return emails.map(this::mapToDTO);
    }

    /**
     * Get sent emails
     */
    @Transactional(readOnly = true)
    public Page<EmailDTO> getSent(Jwt jwt, int page, int size) {
        String userEmail = jwt.getClaim("email");
        Pageable pageable = PageRequest.of(page, size);
        Page<Email> emails = emailRepository.findByFromEmailAndIsSentTrueAndIsDeletedFalseOrderBySentAtDesc(
                userEmail, pageable);
        return emails.map(this::mapToDTO);
    }

    /**
     * Get draft emails
     */
    @Transactional(readOnly = true)
    public Page<EmailDTO> getDrafts(Jwt jwt, int page, int size) {
        String userEmail = jwt.getClaim("email");
        Pageable pageable = PageRequest.of(page, size);
        Page<Email> emails = emailRepository.findByUserIdAndIsDraftTrueAndIsDeletedFalseOrderByCreatedAtDesc(
                userEmail, pageable);
        return emails.map(this::mapToDTO);
    }

    /**
     * Get starred emails
     */
    @Transactional(readOnly = true)
    public Page<EmailDTO> getStarred(Jwt jwt, int page, int size) {
        String userEmail = jwt.getClaim("email");
        Pageable pageable = PageRequest.of(page, size);
        Page<Email> emails = emailRepository.findByUserIdAndIsStarredTrueAndIsDeletedFalseOrderByCreatedAtDesc(
                userEmail, pageable);
        return emails.map(this::mapToDTO);
    }

    /**
     * Get trash emails
     */
    @Transactional(readOnly = true)
    public Page<EmailDTO> getTrash(Jwt jwt, int page, int size) {
        String userEmail = jwt.getClaim("email");
        Pageable pageable = PageRequest.of(page, size);
        Page<Email> emails = emailRepository.findByUserIdAndIsDeletedTrueOrderByCreatedAtDesc(
                userEmail, pageable);
        return emails.map(this::mapToDTO);
    }

    /**
     * Get email by ID
     */
    @Transactional
    public EmailDTO getEmailById(Jwt jwt, Long emailId) {
        String userEmail = jwt.getClaim("email");
        Email email = emailRepository.findByIdAndUserId(emailId, userEmail)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        // Mark as read
        if (!email.getIsRead()) {
            email.setIsRead(true);
            emailRepository.save(email);
        }

        return mapToDTO(email);
    }

    /**
     * Compose/Send email
     */
    @Transactional
    public EmailDTO composeEmail(Jwt jwt, ComposeEmailRequest request) {
        String userEmail = jwt.getClaim("email");
        String userName = jwt.getClaim("name");

        Email.EmailBuilder emailBuilder = Email.builder()
                .userId(userEmail)
                .fromEmail(userEmail)
                .fromName(userName)
                .toEmail(request.getToEmail())
                .toName(request.getToName())
                .cc(request.getCc())
                .bcc(request.getBcc())
                .subject(request.getSubject())
                .body(request.getBody())
                .replyToId(request.getReplyToId());

        // Handle attachments (JSON array)
        if (request.getAttachmentUrls() != null && !request.getAttachmentUrls().isEmpty()) {
            try {
                emailBuilder.attachmentUrls(objectMapper.writeValueAsString(request.getAttachmentUrls()));
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize attachments", e);
            }
        }

        // Check if draft or send
        if (Boolean.TRUE.equals(request.getIsDraft())) {
            emailBuilder.isDraft(true)
                    .folder("drafts")
                    .isSent(false);
        } else {
            emailBuilder.isDraft(false)
                    .isSent(true)
                    .folder("sent")
                    .sentAt(LocalDateTime.now());

            // TODO: In production, integrate with SMTP service to actually send email
            // For now, we just save it to database
            log.info("Email sent from {} to {}", userEmail, request.getToEmail());

            // Create a copy in recipient's inbox (simulated delivery)
            Email recipientEmail = Email.builder()
                    .userId(request.getToEmail())
                    .fromEmail(userEmail)
                    .fromName(userName)
                    .toEmail(request.getToEmail())
                    .toName(request.getToName())
                    .subject(request.getSubject())
                    .body(request.getBody())
                    .folder("inbox")
                    .isRead(false)
                    .isSent(false)
                    .isDraft(false)
                    .sentAt(LocalDateTime.now())
                    .build();
            emailRepository.save(recipientEmail);
        }

        Email email = emailBuilder.build();
        email = emailRepository.save(email);

        return mapToDTO(email);
    }

    /**
     * Update email (mark as read/starred/deleted)
     */
    @Transactional
    public EmailDTO updateEmail(Jwt jwt, Long emailId, EmailDTO updateDTO) {
        String userEmail = jwt.getClaim("email");
        Email email = emailRepository.findByIdAndUserId(emailId, userEmail)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        if (updateDTO.getIsRead() != null) {
            email.setIsRead(updateDTO.getIsRead());
        }
        if (updateDTO.getIsStarred() != null) {
            email.setIsStarred(updateDTO.getIsStarred());
        }
        if (updateDTO.getIsDeleted() != null) {
            email.setIsDeleted(updateDTO.getIsDeleted());
            email.setFolder(updateDTO.getIsDeleted() ? "trash" : "inbox");
        }

        email = emailRepository.save(email);
        return mapToDTO(email);
    }

    /**
     * Delete email permanently
     */
    @Transactional
    public void deleteEmail(Jwt jwt, Long emailId) {
        String userEmail = jwt.getClaim("email");
        Email email = emailRepository.findByIdAndUserId(emailId, userEmail)
                .orElseThrow(() -> new RuntimeException("Email not found"));
        emailRepository.delete(email);
    }

    /**
     * Get unread count
     */
    @Transactional(readOnly = true)
    public Long getUnreadCount(Jwt jwt) {
        String userEmail = jwt.getClaim("email");
        return emailRepository.countUnreadByUserId(userEmail);
    }

    /**
     * Search emails
     */
    @Transactional(readOnly = true)
    public Page<EmailDTO> searchEmails(Jwt jwt, String query, int page, int size) {
        String userEmail = jwt.getClaim("email");
        Pageable pageable = PageRequest.of(page, size);
        Page<Email> emails = emailRepository.searchEmails(userEmail, query, pageable);
        return emails.map(this::mapToDTO);
    }

    private EmailDTO mapToDTO(Email email) {
        List<String> attachments = Collections.emptyList();
        if (email.getAttachmentUrls() != null) {
            try {
                attachments = objectMapper.readValue(email.getAttachmentUrls(), List.class);
            } catch (JsonProcessingException e) {
                log.error("Failed to deserialize attachments", e);
            }
        }

        return EmailDTO.builder()
                .id(email.getId())
                .fromEmail(email.getFromEmail())
                .fromName(email.getFromName())
                .toEmail(email.getToEmail())
                .toName(email.getToName())
                .cc(email.getCc())
                .bcc(email.getBcc())
                .subject(email.getSubject())
                .body(email.getBody())
                .isRead(email.getIsRead())
                .isStarred(email.getIsStarred())
                .isDraft(email.getIsDraft())
                .isSent(email.getIsSent())
                .folder(email.getFolder())
                .attachmentUrls(attachments)
                .replyToId(email.getReplyToId())
                .createdAt(email.getCreatedAt())
                .sentAt(email.getSentAt())
                .build();
    }
}
