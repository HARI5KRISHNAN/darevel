package com.darevel.slides.service;

import com.darevel.slides.exception.ResourceNotFoundException;
import com.darevel.slides.model.Presentation;
import com.darevel.slides.model.Slide;
import com.darevel.slides.repository.PresentationRepository;
import com.darevel.slides.repository.SlideRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SlideService {

    private final SlideRepository slideRepository;
    private final PresentationRepository presentationRepository;

    @Transactional(readOnly = true)
    public List<Slide> getSlidesByPresentationId(Long presentationId) {
        return slideRepository.findByPresentationIdOrderBySlideOrderAsc(presentationId);
    }

    @Transactional(readOnly = true)
    public Slide getSlideById(Long slideId, Long presentationId) {
        return slideRepository.findByIdAndPresentationId(slideId, presentationId)
                .orElseThrow(() -> new ResourceNotFoundException("Slide", "id", slideId));
    }

    @Transactional
    public Slide createSlide(Long presentationId, Slide slide) {
        Presentation presentation = presentationRepository.findById(presentationId)
                .orElseThrow(() -> new ResourceNotFoundException("Presentation", "id", presentationId));

        slide.setPresentation(presentation);

        // Set order to be at the end
        Integer maxOrder = slideRepository.findMaxOrderByPresentationId(presentationId);
        slide.setSlideOrder(maxOrder != null ? maxOrder + 1 : 0);

        return slideRepository.save(slide);
    }

    @Transactional
    public Slide updateSlide(Long slideId, Long presentationId, Slide updatedSlide) {
        Slide slide = slideRepository.findByIdAndPresentationId(slideId, presentationId)
                .orElseThrow(() -> new ResourceNotFoundException("Slide", "id", slideId));

        slide.setTitle(updatedSlide.getTitle());
        slide.setSubtitle(updatedSlide.getSubtitle());
        slide.setContent(updatedSlide.getContent());
        slide.setLayout(updatedSlide.getLayout());
        slide.setBackgroundColor(updatedSlide.getBackgroundColor());
        slide.setTextColor(updatedSlide.getTextColor());
        slide.setTitleFontSize(updatedSlide.getTitleFontSize());
        slide.setContentFontSize(updatedSlide.getContentFontSize());
        slide.setFontFamily(updatedSlide.getFontFamily());
        slide.setLetterSpacing(updatedSlide.getLetterSpacing());
        slide.setLineHeight(updatedSlide.getLineHeight());
        slide.setTextColumns(updatedSlide.getTextColumns());
        slide.setGradient(updatedSlide.getGradient());
        slide.setImage(updatedSlide.getImage());
        slide.setIsBranching(updatedSlide.getIsBranching());

        return slideRepository.save(slide);
    }

    @Transactional
    public void deleteSlide(Long slideId, Long presentationId) {
        Slide slide = slideRepository.findByIdAndPresentationId(slideId, presentationId)
                .orElseThrow(() -> new ResourceNotFoundException("Slide", "id", slideId));

        slideRepository.delete(slide);
        log.info("Deleted slide: {} from presentation: {}", slideId, presentationId);
    }

    @Transactional
    public Slide duplicateSlide(Long slideId, Long presentationId) {
        Slide original = slideRepository.findByIdAndPresentationId(slideId, presentationId)
                .orElseThrow(() -> new ResourceNotFoundException("Slide", "id", slideId));

        Slide duplicate = new Slide();
        duplicate.setPresentation(original.getPresentation());
        duplicate.setTitle(original.getTitle() + " (Copy)");
        duplicate.setSubtitle(original.getSubtitle());
        duplicate.setContent(original.getContent());
        duplicate.setLayout(original.getLayout());
        duplicate.setBackgroundColor(original.getBackgroundColor());
        duplicate.setTextColor(original.getTextColor());
        duplicate.setTitleFontSize(original.getTitleFontSize());
        duplicate.setContentFontSize(original.getContentFontSize());
        duplicate.setFontFamily(original.getFontFamily());
        duplicate.setLetterSpacing(original.getLetterSpacing());
        duplicate.setLineHeight(original.getLineHeight());
        duplicate.setTextColumns(original.getTextColumns());
        duplicate.setGradient(original.getGradient());
        duplicate.setImage(original.getImage());
        duplicate.setIsBranching(original.getIsBranching());

        Integer maxOrder = slideRepository.findMaxOrderByPresentationId(presentationId);
        duplicate.setSlideOrder(maxOrder != null ? maxOrder + 1 : 0);

        return slideRepository.save(duplicate);
    }

    @Transactional
    public void reorderSlides(Long presentationId, List<Long> slideIds) {
        for (int i = 0; i < slideIds.size(); i++) {
            Long slideId = slideIds.get(i);
            final int order = i;
            slideRepository.findByIdAndPresentationId(slideId, presentationId).ifPresent(slide -> {
                slide.setSlideOrder(order);
                slideRepository.save(slide);
            });
        }
        log.info("Reordered {} slides for presentation: {}", slideIds.size(), presentationId);
    }
}
