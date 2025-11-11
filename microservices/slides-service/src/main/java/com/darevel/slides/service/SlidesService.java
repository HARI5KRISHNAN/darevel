package com.darevel.slides.service;

import com.darevel.slides.dto.PresentationDTO;
import com.darevel.slides.entity.Presentation;
import com.darevel.slides.repository.PresentationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SlidesService {

    private final PresentationRepository presentationRepository;

    @Transactional(readOnly = true)
    public List<PresentationDTO> getPresentations(Jwt jwt) {
        String userId = jwt.getSubject();
        List<Presentation> presentations = presentationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return presentations.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PresentationDTO getPresentationById(Jwt jwt, Long id) {
        String userId = jwt.getSubject();
        Presentation presentation = presentationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Presentation not found"));
        return mapToDTO(presentation);
    }

    @Transactional
    public PresentationDTO createPresentation(Jwt jwt, PresentationDTO dto) {
        String userId = jwt.getSubject();
        Presentation presentation = Presentation.builder()
                .userId(userId)
                .title(dto.getTitle())
                .content(dto.getContent())
                .thumbnailUrl(dto.getThumbnailUrl())
                .isShared(dto.getIsShared() != null ? dto.getIsShared() : false)
                .sharedWith(dto.getSharedWith())
                .build();
        presentation = presentationRepository.save(presentation);
        return mapToDTO(presentation);
    }

    @Transactional
    public PresentationDTO updatePresentation(Jwt jwt, Long id, PresentationDTO dto) {
        String userId = jwt.getSubject();
        Presentation presentation = presentationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Presentation not found"));

        if (dto.getTitle() != null) presentation.setTitle(dto.getTitle());
        if (dto.getContent() != null) presentation.setContent(dto.getContent());
        if (dto.getThumbnailUrl() != null) presentation.setThumbnailUrl(dto.getThumbnailUrl());
        if (dto.getIsShared() != null) presentation.setIsShared(dto.getIsShared());
        if (dto.getSharedWith() != null) presentation.setSharedWith(dto.getSharedWith());

        presentation = presentationRepository.save(presentation);
        return mapToDTO(presentation);
    }

    @Transactional
    public void deletePresentation(Jwt jwt, Long id) {
        String userId = jwt.getSubject();
        Presentation presentation = presentationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Presentation not found"));
        presentationRepository.delete(presentation);
    }

    private PresentationDTO mapToDTO(Presentation presentation) {
        return PresentationDTO.builder()
                .id(presentation.getId())
                .title(presentation.getTitle())
                .content(presentation.getContent())
                .thumbnailUrl(presentation.getThumbnailUrl())
                .isShared(presentation.getIsShared())
                .sharedWith(presentation.getSharedWith())
                .createdAt(presentation.getCreatedAt())
                .updatedAt(presentation.getUpdatedAt())
                .build();
    }
}
