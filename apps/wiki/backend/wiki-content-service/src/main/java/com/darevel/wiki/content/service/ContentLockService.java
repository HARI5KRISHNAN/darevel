package com.darevel.wiki.content.service;

import com.darevel.wiki.content.domain.ContentLock;
import com.darevel.wiki.content.dto.AcquireLockRequest;
import com.darevel.wiki.content.dto.LockResponse;
import com.darevel.wiki.content.repository.ContentLockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing content editing locks
 * Prevents concurrent editing conflicts
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ContentLockService {

    private static final Duration LOCK_DURATION = Duration.ofMinutes(5);

    private final ContentLockRepository lockRepository;

    /**
     * Acquire a lock for editing a page
     * Returns existing lock if already owned by the same user/session
     * Fails if locked by another user
     */
    @Transactional
    public LockResponse acquireLock(AcquireLockRequest request) {
        UUID pageId = request.pageId();
        UUID userId = request.userId();
        String sessionId = request.sessionId();

        Optional<ContentLock> existingLock = lockRepository.findByPageId(pageId);

        if (existingLock.isPresent()) {
            ContentLock lock = existingLock.get();

            // Check if expired
            if (lock.isExpired()) {
                // Remove expired lock and acquire new one
                lockRepository.delete(lock);
                return createNewLock(pageId, userId, sessionId);
            }

            // Check if owned by the same user/session
            if (lock.belongsTo(userId, sessionId)) {
                // Extend the lock
                lock.setExpiresAt(Instant.now().plus(LOCK_DURATION));
                lockRepository.save(lock);
                return toLockResponse(lock, true);
            }

            // Locked by another user
            return toLockResponse(lock, true);
        }

        // No existing lock, create new one
        return createNewLock(pageId, userId, sessionId);
    }

    /**
     * Release a lock
     */
    @Transactional
    public void releaseLock(UUID pageId, UUID userId, String sessionId) {
        Optional<ContentLock> lockOpt = lockRepository.findByPageId(pageId);

        if (lockOpt.isPresent()) {
            ContentLock lock = lockOpt.get();
            if (lock.belongsTo(userId, sessionId)) {
                lockRepository.delete(lock);
                log.info("Released lock for page: {} by user: {}", pageId, userId);
            } else {
                log.warn("User {} attempted to release lock owned by {}", userId, lock.getLockedBy());
            }
        }
    }

    /**
     * Get current lock status for a page
     */
    @Transactional(readOnly = true)
    public LockResponse getLockStatus(UUID pageId) {
        Optional<ContentLock> lockOpt = lockRepository.findByPageId(pageId);

        if (lockOpt.isPresent()) {
            ContentLock lock = lockOpt.get();
            if (lock.isExpired()) {
                return new LockResponse(pageId, null, null, null, null, false);
            }
            return toLockResponse(lock, true);
        }

        return new LockResponse(pageId, null, null, null, null, false);
    }

    /**
     * Cleanup expired locks (scheduled task)
     */
    @Scheduled(fixedRate = 60000) // Every minute
    @Transactional
    public void cleanupExpiredLocks() {
        int deleted = lockRepository.deleteExpiredLocks(Instant.now());
        if (deleted > 0) {
            log.info("Cleaned up {} expired locks", deleted);
        }
    }

    private LockResponse createNewLock(UUID pageId, UUID userId, String sessionId) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(LOCK_DURATION);

        ContentLock lock = ContentLock.builder()
            .pageId(pageId)
            .lockedBy(userId)
            .lockedAt(now)
            .expiresAt(expiresAt)
            .sessionId(sessionId)
            .build();

        lockRepository.save(lock);
        log.info("Acquired lock for page: {} by user: {}", pageId, userId);

        return toLockResponse(lock, true);
    }

    private LockResponse toLockResponse(ContentLock lock, boolean isLocked) {
        return new LockResponse(
            lock.getPageId(),
            lock.getLockedBy(),
            lock.getLockedAt(),
            lock.getExpiresAt(),
            lock.getSessionId(),
            isLocked
        );
    }
}
