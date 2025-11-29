package com.darevel.form.service;

import com.darevel.form.domain.Form;
import com.darevel.form.domain.FormField;
import com.darevel.form.domain.FormSection;
import com.darevel.form.dto.*;
import com.darevel.form.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FormService {

    private final FormRepository formRepository;
    private final FormFieldRepository formFieldRepository;
    private final FormSectionRepository formSectionRepository;
    private final FormFieldOptionRepository formFieldOptionRepository;
    private final FormLogicRuleRepository formLogicRuleRepository;

    @Transactional
    public FormDTO createForm(FormDTO formDTO, UUID ownerId) {
        Form form = Form.builder()
                .ownerId(ownerId)
                .title(formDTO.getTitle())
                .description(formDTO.getDescription())
                .status(Form.FormStatus.DRAFT)
                .isPublic(false)
                .acceptingResponses(false)
                .allowMultipleSubmissions(false)
                .requireAuthentication(true)
                .shuffleQuestions(false)
                .showProgressBar(true)
                .currentResponseCount(0)
                .build();

        form = formRepository.save(form);
        log.info("Created form with ID: {} for owner: {}", form.getId(), ownerId);
        
        return mapToDTO(form);
    }

    public Page<FormDTO> getUserForms(UUID ownerId, Pageable pageable) {
        return formRepository.findByOwnerId(ownerId, pageable)
                .map(this::mapToDTO);
    }

    public FormDTO getFormById(UUID formId, UUID userId) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        if (!form.getOwnerId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to form");
        }
        
        return mapToDTO(form);
    }

    public FormDetailDTO getFormDetails(UUID formId, UUID userId) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        if (!form.getOwnerId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to form");
        }

        FormDetailDTO detailDTO = new FormDetailDTO();
        detailDTO.setId(form.getId());
        detailDTO.setTitle(form.getTitle());
        detailDTO.setDescription(form.getDescription());
        detailDTO.setStatus(form.getStatus().name());
        detailDTO.setIsPublic(form.getIsPublic());
        detailDTO.setPublicId(form.getPublicId());
        detailDTO.setAcceptingResponses(form.getAcceptingResponses());

        // Load sections
        List<FormSection> sections = formSectionRepository.findByFormIdOrderByPositionAsc(formId);
        detailDTO.setSections(sections.stream()
                .map(this::mapSectionToDTO)
                .collect(Collectors.toList()));

        // Load fields
        List<FormField> fields = formFieldRepository.findByFormIdOrderByPositionAsc(formId);
        detailDTO.setFields(fields.stream()
                .map(this::mapFieldToDTO)
                .collect(Collectors.toList()));

        return detailDTO;
    }

    @Transactional
    public FormDTO updateForm(UUID formId, FormDTO formDTO, UUID userId) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        if (!form.getOwnerId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to form");
        }

        form.setTitle(formDTO.getTitle());
        form.setDescription(formDTO.getDescription());
        if (formDTO.getStatus() != null) {
            form.setStatus(formDTO.getStatus());
        }
        if (formDTO.getAcceptingResponses() != null) {
            form.setAcceptingResponses(formDTO.getAcceptingResponses());
        }

        form = formRepository.save(form);
        log.info("Updated form with ID: {}", formId);
        
        return mapToDTO(form);
    }

    @Transactional
    public void deleteForm(UUID formId, UUID userId) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        if (!form.getOwnerId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to form");
        }

        formRepository.delete(form);
        log.info("Deleted form with ID: {}", formId);
    }

    @Transactional
    public String generatePublicLink(UUID formId, UUID userId) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        if (!form.getOwnerId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to form");
        }

        if (form.getPublicId() == null) {
            String publicId = UUID.randomUUID().toString().substring(0, 8);
            form.setPublicId(publicId);
            form.setIsPublic(true);
            formRepository.save(form);
        }

        return form.getPublicId();
    }

    private FormDTO mapToDTO(Form form) {
        FormDTO dto = new FormDTO();
        dto.setId(form.getId());
        dto.setOwnerId(form.getOwnerId());
        dto.setTitle(form.getTitle());
        dto.setDescription(form.getDescription());
        dto.setStatus(form.getStatus());
        dto.setThemeId(form.getThemeId());
        dto.setIsPublic(form.getIsPublic());
        dto.setPublicId(form.getPublicId());
        dto.setAcceptingResponses(form.getAcceptingResponses());
        dto.setCurrentResponseCount(form.getCurrentResponseCount());
        dto.setCreatedAt(form.getCreatedAt());
        dto.setUpdatedAt(form.getUpdatedAt());
        return dto;
    }

    private FormSectionDTO mapSectionToDTO(FormSection section) {
        FormSectionDTO dto = new FormSectionDTO();
        dto.setId(section.getId());
        dto.setFormId(section.getFormId());
        dto.setTitle(section.getTitle());
        dto.setDescription(section.getDescription());
        dto.setPosition(section.getPosition());
        return dto;
    }

    private FormFieldDTO mapFieldToDTO(FormField field) {
        FormFieldDTO dto = new FormFieldDTO();
        dto.setId(field.getId());
        dto.setFormId(field.getFormId());
        dto.setSectionId(field.getSectionId());
        dto.setLabel(field.getLabel());
        dto.setDescription(field.getDescription());
        dto.setType(field.getType());
        dto.setIsRequired(field.getIsRequired());
        dto.setPosition(field.getPosition());
        dto.setConfigJson(field.getConfigJson());
        return dto;
    }
}
