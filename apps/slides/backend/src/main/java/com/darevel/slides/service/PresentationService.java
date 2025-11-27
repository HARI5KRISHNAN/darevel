package com.darevel.slides.service;

import com.darevel.slides.exception.ResourceNotFoundException;
import com.darevel.slides.exception.UnauthorizedException;
import com.darevel.slides.model.Presentation;
import com.darevel.slides.repository.PresentationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PresentationService {

    private final PresentationRepository presentationRepository;

    @Transactional(readOnly = true)
    public List<Presentation> getAllPresentations(String ownerId) {
        return presentationRepository.findByOwnerIdOrderByUpdatedAtDesc(ownerId);
    }

    @Transactional(readOnly = true)
    public Presentation getPresentationById(Long id, String ownerId) {
        Presentation presentation = presentationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Presentation", "id", id));

        // Check ownership
        if (!presentation.getOwnerId().equals(ownerId) && !Boolean.TRUE.equals(presentation.getIsPublic())) {
            throw new UnauthorizedException("You don't have access to this presentation");
        }

        return presentation;
    }

    @Transactional
    public Presentation createPresentation(Presentation presentation) {
        log.info("Creating presentation: {} for owner: {}", presentation.getTitle(), presentation.getOwnerId());
        return presentationRepository.save(presentation);
    }

    @Transactional
    public Presentation updatePresentation(Long id, String ownerId, Presentation updatedPresentation) {
        Presentation presentation = presentationRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Presentation", "id", id));

        presentation.setTitle(updatedPresentation.getTitle());
        presentation.setDescription(updatedPresentation.getDescription());
        presentation.setIsPublic(updatedPresentation.getIsPublic());

        return presentationRepository.save(presentation);
    }

    @Transactional
    public void deletePresentation(Long id, String ownerId) {
        Presentation presentation = presentationRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Presentation", "id", id));

        presentationRepository.delete(presentation);
        log.info("Deleted presentation: {} by owner: {}", id, ownerId);
    }

    @Transactional
    public Presentation duplicatePresentation(Long id, String ownerId) {
        Presentation original = presentationRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Presentation", "id", id));

        Presentation duplicate = new Presentation();
        duplicate.setTitle(original.getTitle() + " (Copy)");
        duplicate.setDescription(original.getDescription());
        duplicate.setOwnerId(ownerId);
        duplicate.setCreatedBy(original.getCreatedBy());
        duplicate.setIsPublic(false);

        return presentationRepository.save(duplicate);
    }

    @Transactional
    public void incrementViewCount(Long id) {
        presentationRepository.findById(id).ifPresent(presentation -> {
            presentation.setViewCount(presentation.getViewCount() + 1);
            presentationRepository.save(presentation);
        });
    }
}
