package com.darevel.wiki.space.service;

import com.darevel.wiki.space.domain.Space;
import com.darevel.wiki.space.domain.SpaceMember;
import com.darevel.wiki.space.domain.SpaceVisibility;
import com.darevel.wiki.space.dto.AddSpaceMemberRequest;
import com.darevel.wiki.space.dto.CreateSpaceRequest;
import com.darevel.wiki.space.dto.SpaceMemberResponse;
import com.darevel.wiki.space.dto.SpaceResponse;
import com.darevel.wiki.space.dto.SpaceSummaryResponse;
import com.darevel.wiki.space.dto.UpdateSpaceMemberRoleRequest;
import com.darevel.wiki.space.dto.UpdateSpaceRequest;
import com.darevel.wiki.space.event.SpaceEvent;
import com.darevel.wiki.space.event.SpaceEventType;
import com.darevel.wiki.space.exception.SpaceKeyAlreadyExistsException;
import com.darevel.wiki.space.exception.SpaceMemberAlreadyExistsException;
import com.darevel.wiki.space.exception.SpaceMemberNotFoundException;
import com.darevel.wiki.space.exception.SpaceNotFoundException;
import com.darevel.wiki.space.mapper.SpaceMapper;
import com.darevel.wiki.space.repository.SpaceMemberRepository;
import com.darevel.wiki.space.repository.SpaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpaceService {

    private final SpaceRepository spaceRepository;
    private final SpaceMemberRepository spaceMemberRepository;
    private final SpaceMapper spaceMapper;
    private final SpaceEventPublisher eventPublisher;

    @Transactional
    public SpaceResponse createSpace(CreateSpaceRequest request) {
        String normalizedKey = request.key().trim().toUpperCase(Locale.ROOT);
        if (spaceRepository.existsByKeyIgnoreCase(normalizedKey)) {
            throw new SpaceKeyAlreadyExistsException(normalizedKey);
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        Space space = Space.builder()
            .key(normalizedKey)
            .name(request.name())
            .description(request.description())
            .visibility(request.visibility())
            .ownerId(request.ownerId())
            .createdAt(now)
            .updatedAt(now)
            .build();
        Space saved = spaceRepository.save(space);

        SpaceMember ownerMember = SpaceMember.builder()
            .space(saved)
            .userId(request.ownerId())
            .role(SpaceMember.Role.ADMIN)
            .invitedBy(request.ownerId())
            .createdAt(now)
            .build();
        spaceMemberRepository.save(ownerMember);

        publishEvent(saved, SpaceEventType.SPACE_CREATED, Map.of(
            "ownerId", request.ownerId().toString(),
            "visibility", saved.getVisibility().name()
        ));

        List<SpaceMember> members = spaceMemberRepository.findAllBySpace(saved);
        return spaceMapper.toResponse(saved, members);
    }

    @Transactional(readOnly = true)
    public SpaceResponse getSpace(UUID spaceId) {
        Space space = getSpaceOrThrow(spaceId);
        List<SpaceMember> members = spaceMemberRepository.findAllBySpace(space);
        return spaceMapper.toResponse(space, members);
    }

    @Transactional(readOnly = true)
    public SpaceResponse getSpaceByKey(String key) {
        Space space = spaceRepository.findByKeyIgnoreCase(key)
            .orElseThrow(() -> new SpaceNotFoundException("Space not found: " + key));
        List<SpaceMember> members = spaceMemberRepository.findAllBySpace(space);
        return spaceMapper.toResponse(space, members);
    }

    @Transactional(readOnly = true)
    public List<SpaceSummaryResponse> findSpacesForOwner(UUID ownerId) {
        return spaceRepository.findAllByOwnerId(ownerId)
            .stream()
            .map(space -> spaceMapper.toSummary(space, spaceMemberRepository.countBySpace(space)))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<SpaceSummaryResponse> findSpacesByVisibility(SpaceVisibility visibility) {
        return spaceRepository.findAllByVisibility(visibility)
            .stream()
            .map(space -> spaceMapper.toSummary(space, spaceMemberRepository.countBySpace(space)))
            .toList();
    }

    @Transactional
    public SpaceResponse updateSpace(UUID spaceId, UpdateSpaceRequest request) {
        Space space = getSpaceOrThrow(spaceId);
        space.setName(request.name());
        space.setDescription(request.description());
        space.setVisibility(request.visibility());
        space.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        publishEvent(space, SpaceEventType.SPACE_UPDATED, Map.of(
            "name", request.name(),
            "visibility", request.visibility().name()
        ));

        List<SpaceMember> members = spaceMemberRepository.findAllBySpace(space);
        return spaceMapper.toResponse(space, members);
    }

    @Transactional
    public void deleteSpace(UUID spaceId) {
        Space space = getSpaceOrThrow(spaceId);
        spaceMemberRepository.deleteAll(spaceMemberRepository.findAllBySpace(space));
        spaceRepository.delete(space);
        publishEvent(space, SpaceEventType.SPACE_DELETED, Map.of());
    }

    @Transactional
    public SpaceMemberResponse addMember(UUID spaceId, AddSpaceMemberRequest request) {
        Space space = getSpaceOrThrow(spaceId);
        if (spaceMemberRepository.existsBySpaceAndUserId(space, request.userId())) {
            throw new SpaceMemberAlreadyExistsException();
        }

        SpaceMember member = SpaceMember.builder()
            .space(space)
            .userId(request.userId())
            .role(request.role())
            .invitedBy(request.invitedBy())
            .createdAt(OffsetDateTime.now(ZoneOffset.UTC))
            .build();
        SpaceMember saved = spaceMemberRepository.save(member);

        publishEvent(space, SpaceEventType.MEMBER_ADDED, Map.of(
            "userId", request.userId().toString(),
            "role", request.role().name()
        ));

        return spaceMapper.toMemberResponse(saved);
    }

    @Transactional
    public SpaceMemberResponse updateMemberRole(UUID spaceId, UUID userId, UpdateSpaceMemberRoleRequest request) {
        Space space = getSpaceOrThrow(spaceId);
        SpaceMember member = spaceMemberRepository.findBySpaceAndUserId(space, userId)
            .orElseThrow(SpaceMemberNotFoundException::new);
        member.setRole(request.role());

        publishEvent(space, SpaceEventType.MEMBER_ROLE_CHANGED, Map.of(
            "userId", userId.toString(),
            "role", request.role().name()
        ));

        return spaceMapper.toMemberResponse(member);
    }

    @Transactional
    public void removeMember(UUID spaceId, UUID userId) {
        Space space = getSpaceOrThrow(spaceId);
        if (!spaceMemberRepository.existsBySpaceAndUserId(space, userId)) {
            throw new SpaceMemberNotFoundException();
        }
        spaceMemberRepository.deleteBySpaceAndUserId(space, userId);
        publishEvent(space, SpaceEventType.MEMBER_REMOVED, Map.of("userId", userId.toString()));
    }

    @Transactional(readOnly = true)
    public List<SpaceMemberResponse> listMembers(UUID spaceId) {
        Space space = getSpaceOrThrow(spaceId);
        return spaceMemberRepository.findAllBySpace(space)
            .stream()
            .map(spaceMapper::toMemberResponse)
            .toList();
    }

    private Space getSpaceOrThrow(UUID spaceId) {
        return spaceRepository.findById(spaceId)
            .orElseThrow(() -> new SpaceNotFoundException("Space not found: " + spaceId));
    }

    private void publishEvent(Space space, SpaceEventType type, Map<String, Object> payload) {
        SpaceEvent event = new SpaceEvent(
            type,
            space.getId(),
            space.getKey(),
            OffsetDateTime.now(ZoneOffset.UTC),
            new HashMap<>(payload)
        );
        eventPublisher.publish(event);
    }
}
