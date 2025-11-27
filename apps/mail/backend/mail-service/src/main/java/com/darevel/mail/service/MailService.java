package com.darevel.mail.service;

import com.darevel.mail.dto.FolderCountsDTO;
import com.darevel.mail.dto.MailDTO;
import com.darevel.mail.model.Mail;
import com.darevel.mail.repository.DraftRepository;
import com.darevel.mail.repository.MailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MailService {

    @Autowired
    private MailRepository mailRepository;

    @Autowired
    private DraftRepository draftRepository;

    @Autowired
    private SmtpService smtpService;

    @Value("${mail.domain:darevel.local}")
    private String mailDomain;

    public String getUserEmail(String username) {
        return username.contains("@") ? username : username + "@" + mailDomain;
    }

    @Transactional(readOnly = true)
    public List<MailDTO> getInbox(String owner) {
        String userEmail = getUserEmail(owner);
        return mailRepository.findInboxByOwnerOrRecipient(owner, userEmail)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MailDTO> getSent(String owner) {
        return mailRepository.findSentByOwner(owner)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MailDTO> getSpam(String owner) {
        String userEmail = getUserEmail(owner);
        return mailRepository.findSpamByOwnerOrRecipient(owner, userEmail)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MailDTO> getTrash(String owner) {
        String userEmail = getUserEmail(owner);
        return mailRepository.findTrashByOwnerOrRecipient(owner, userEmail)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MailDTO> getImportant(String owner) {
        String userEmail = getUserEmail(owner);
        return mailRepository.findImportantByOwnerOrRecipient(owner, userEmail)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FolderCountsDTO getCounts(String owner) {
        String userEmail = getUserEmail(owner);
        Object[] result = mailRepository.getMailCounts(owner, userEmail);

        FolderCountsDTO counts = new FolderCountsDTO();
        if (result != null && result.length > 0 && result[0] instanceof Object[]) {
            Object[] row = (Object[]) result[0];
            counts.setInbox(((Number) row[0]).intValue());
            counts.setSent(((Number) row[1]).intValue());
            counts.setImportant(((Number) row[2]).intValue());
            counts.setSpam(((Number) row[3]).intValue());
            counts.setTrash(((Number) row[4]).intValue());
        }
        counts.setDraft(draftRepository.countByUserEmail(userEmail));
        return counts;
    }

    @Transactional(readOnly = true)
    public List<MailDTO> search(String owner, String query) {
        return mailRepository.searchMails(owner, query)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<MailDTO> getMailById(Long id, String owner) {
        String userEmail = getUserEmail(owner);
        return mailRepository.findById(id)
                .filter(mail -> mail.getOwner().equals(owner) ||
                        (mail.getToAddresses() != null && Arrays.asList(mail.getToAddresses()).contains(userEmail)))
                .map(this::convertToDTO);
    }

    @Transactional
    public MailDTO sendMail(String owner, List<String> to, String subject, String text, String html) {
        String fromAddress = getUserEmail(owner);

        // Create mail record
        Mail mail = new Mail();
        mail.setMessageId(UUID.randomUUID().toString());
        mail.setFromAddress(fromAddress);
        mail.setToAddresses(to.toArray(new String[0]));
        mail.setSubject(subject);
        mail.setBodyText(text);
        mail.setBodyHtml(html);
        mail.setFolder("SENT");
        mail.setOwner(owner);
        mail.setIsRead(true);
        mail.setIsStarred(false);
        mail.setCreatedAt(LocalDateTime.now());

        Mail saved = mailRepository.save(mail);

        // Actually send via SMTP
        smtpService.sendEmail(fromAddress, to, subject, text, html);

        return convertToDTO(saved);
    }

    @Transactional
    public boolean markAsRead(Long id, String owner) {
        String userEmail = getUserEmail(owner);
        return mailRepository.findById(id)
                .filter(mail -> mail.getOwner().equals(owner) ||
                        (mail.getToAddresses() != null && Arrays.asList(mail.getToAddresses()).contains(userEmail)))
                .map(mail -> {
                    mail.setIsRead(true);
                    mailRepository.save(mail);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public boolean markAsUnread(Long id, String owner) {
        String userEmail = getUserEmail(owner);
        return mailRepository.findById(id)
                .filter(mail -> mail.getOwner().equals(owner) ||
                        (mail.getToAddresses() != null && Arrays.asList(mail.getToAddresses()).contains(userEmail)))
                .map(mail -> {
                    mail.setIsRead(false);
                    mailRepository.save(mail);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public boolean toggleStar(Long id, String owner, boolean isStarred) {
        String userEmail = getUserEmail(owner);
        return mailRepository.findById(id)
                .filter(mail -> mail.getOwner().equals(owner) ||
                        (mail.getToAddresses() != null && Arrays.asList(mail.getToAddresses()).contains(userEmail)))
                .map(mail -> {
                    mail.setIsStarred(isStarred);
                    mailRepository.save(mail);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public Optional<MailDTO> moveToFolder(Long id, String owner, String folder) {
        String userEmail = getUserEmail(owner);
        return mailRepository.findById(id)
                .filter(mail -> mail.getOwner().equals(owner) ||
                        (mail.getToAddresses() != null && Arrays.asList(mail.getToAddresses()).contains(userEmail)))
                .map(mail -> {
                    mail.setFolder(folder);
                    mail.setIsSpam("SPAM".equals(folder));
                    return convertToDTO(mailRepository.save(mail));
                });
    }

    @Transactional
    public boolean softDelete(Long id, String owner) {
        return moveToFolder(id, owner, "TRASH").isPresent();
    }

    @Transactional
    public boolean permanentDelete(Long id, String owner) {
        String userEmail = getUserEmail(owner);
        return mailRepository.findById(id)
                .filter(mail -> mail.getOwner().equals(owner) ||
                        (mail.getToAddresses() != null && Arrays.asList(mail.getToAddresses()).contains(userEmail)))
                .map(mail -> {
                    mailRepository.delete(mail);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public int bulkAction(String owner, List<Long> ids, String action, String folder) {
        String userEmail = getUserEmail(owner);
        List<Mail> mails = mailRepository.findByIdsAndOwnerOrRecipient(
                ids, owner, userEmail);

        if (mails.isEmpty()) return 0;

        switch (action) {
            case "delete":
                mails.forEach(m -> m.setFolder("TRASH"));
                break;
            case "spam":
                mails.forEach(m -> {
                    m.setFolder("SPAM");
                    m.setIsSpam(true);
                });
                break;
            case "move":
                mails.forEach(m -> m.setFolder(folder));
                break;
            case "read":
                mails.forEach(m -> m.setIsRead(true));
                break;
            case "unread":
                mails.forEach(m -> m.setIsRead(false));
                break;
            default:
                return 0;
        }

        mailRepository.saveAll(mails);
        return mails.size();
    }

    private MailDTO convertToDTO(Mail mail) {
        MailDTO dto = new MailDTO();
        dto.setId(mail.getId());
        dto.setMessageId(mail.getMessageId());
        dto.setFromAddress(mail.getFromAddress());
        dto.setToAddresses(mail.getToAddresses() != null ? Arrays.asList(mail.getToAddresses()) : List.of());
        dto.setSubject(mail.getSubject());
        dto.setBodyText(mail.getBodyText());
        dto.setBodyHtml(mail.getBodyHtml());
        dto.setFolder(mail.getFolder());
        dto.setOwner(mail.getOwner());
        dto.setIsStarred(mail.getIsStarred());
        dto.setIsRead(mail.getIsRead());
        dto.setIsSpam(mail.getIsSpam());
        dto.setCreatedAt(mail.getCreatedAt());
        return dto;
    }
}
