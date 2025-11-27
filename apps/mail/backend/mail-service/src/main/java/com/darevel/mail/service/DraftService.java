package com.darevel.mail.service;

import com.darevel.mail.dto.DraftDTO;
import com.darevel.mail.model.Draft;
import com.darevel.mail.repository.DraftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DraftService {

    @Autowired
    private DraftRepository draftRepository;

    @Value("${mail.domain:darevel.local}")
    private String mailDomain;

    public String getUserEmail(String username) {
        return username.contains("@") ? username : username + "@" + mailDomain;
    }

    @Transactional(readOnly = true)
    public List<DraftDTO> getDrafts(String owner) {
        String userEmail = getUserEmail(owner);
        return draftRepository.findByUserEmailOrderByUpdatedAtDesc(userEmail)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<DraftDTO> getDraftById(Long id, String owner) {
        String userEmail = getUserEmail(owner);
        return draftRepository.findByIdAndUserEmail(id, userEmail)
                .map(this::convertToDTO);
    }

    @Transactional
    public DraftDTO saveDraft(String owner, Long id, List<String> to, List<String> cc,
                              String subject, String body, String draftType, Long inReplyTo, List<String> attachments) {
        String userEmail = getUserEmail(owner);

        Draft draft;
        if (id != null) {
            draft = draftRepository.findByIdAndUserEmail(id, userEmail)
                    .orElseThrow(() -> new RuntimeException("Draft not found or access denied"));
        } else {
            draft = new Draft();
            draft.setUserEmail(userEmail);
        }

        draft.setToRecipients(to != null ? to.toArray(new String[0]) : new String[0]);
        draft.setCcRecipients(cc != null ? cc.toArray(new String[0]) : new String[0]);
        draft.setSubject(subject != null ? subject : "");
        draft.setBody(body != null ? body : "");
        draft.setDraftType(draftType != null ? draftType : "compose");
        draft.setInReplyTo(inReplyTo);
        draft.setAttachments(attachments != null ? attachments.toArray(new String[0]) : new String[0]);

        return convertToDTO(draftRepository.save(draft));
    }

    @Transactional
    public boolean deleteDraft(Long id, String owner) {
        String userEmail = getUserEmail(owner);
        return draftRepository.findByIdAndUserEmail(id, userEmail)
                .map(draft -> {
                    draftRepository.delete(draft);
                    return true;
                })
                .orElse(false);
    }

    private DraftDTO convertToDTO(Draft draft) {
        DraftDTO dto = new DraftDTO();
        dto.setId(draft.getId());
        dto.setUserEmail(draft.getUserEmail());
        dto.setToRecipients(draft.getToRecipients() != null ? Arrays.asList(draft.getToRecipients()) : List.of());
        dto.setCcRecipients(draft.getCcRecipients() != null ? Arrays.asList(draft.getCcRecipients()) : List.of());
        dto.setSubject(draft.getSubject());
        dto.setBody(draft.getBody());
        dto.setDraftType(draft.getDraftType());
        dto.setInReplyTo(draft.getInReplyTo());
        dto.setAttachments(draft.getAttachments() != null ? Arrays.asList(draft.getAttachments()) : List.of());
        dto.setCreatedAt(draft.getCreatedAt());
        dto.setUpdatedAt(draft.getUpdatedAt());
        return dto;
    }
}
