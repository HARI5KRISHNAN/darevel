package com.darevel.slides.repository;

import com.darevel.slides.model.Slide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SlideRepository extends JpaRepository<Slide, Long> {

    List<Slide> findByPresentationIdOrderBySlideOrderAsc(Long presentationId);

    Optional<Slide> findByIdAndPresentationId(Long id, Long presentationId);

    @Query("SELECT MAX(s.slideOrder) FROM Slide s WHERE s.presentation.id = :presentationId")
    Integer findMaxOrderByPresentationId(@Param("presentationId") Long presentationId);

    @Modifying
    @Query("UPDATE Slide s SET s.slideOrder = s.slideOrder + 1 WHERE s.presentation.id = :presentationId AND s.slideOrder >= :order")
    void incrementOrderFrom(@Param("presentationId") Long presentationId, @Param("order") Integer order);

    void deleteByPresentationId(Long presentationId);
}
