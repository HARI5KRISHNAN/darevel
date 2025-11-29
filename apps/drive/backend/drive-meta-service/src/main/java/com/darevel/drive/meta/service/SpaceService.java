package com.darevel.drive.meta.service;

import com.darevel.drive.meta.domain.DriveSpace;
import com.darevel.drive.meta.domain.SpaceType;
import com.darevel.drive.meta.dto.CreateSpaceRequest;
import com.darevel.drive.meta.dto.SpaceResponse;
import com.darevel.drive.meta.exception.SpaceNotFoundException;
import com.darevel.drive.meta.mapper.DriveMapper;
import com.darevel.drive.meta.repository.DriveSpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SpaceService {

    private final DriveSpaceRepository spaceRepository;
    private final DriveMapper driveMapper;

    @Transactional
    public SpaceResponse createSpace(CreateSpaceRequest request) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        DriveSpace space = DriveSpace.builder()
            .ownerId(request.ownerId())
            .name(request.name())
            .type(request.type())
            .createdAt(now)
            .updatedAt(now)
            .build();
        DriveSpace saved = spaceRepository.save(space);
        return driveMapper.toSpaceResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SpaceResponse> listSpacesForOwner(UUID ownerId) {
        return spaceRepository.findAllByOwnerId(ownerId)
            .stream()
            .map(driveMapper::toSpaceResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<SpaceResponse> listTeamSpaces() {
        return listSpacesByType(SpaceType.TEAM);
    }

    @Transactional(readOnly = true)
    public List<SpaceResponse> listSpacesByType(SpaceType type) {
        return spaceRepository.findAllByType(type)
            .stream()
            .map(driveMapper::toSpaceResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public DriveSpace getSpace(UUID spaceId) {
        return spaceRepository.findById(spaceId)
            .orElseThrow(() -> new SpaceNotFoundException("Space not found: " + spaceId));
    }

    @Transactional(readOnly = true)
    public SpaceResponse getSpaceDetails(UUID spaceId) {
        return driveMapper.toSpaceResponse(getSpace(spaceId));
    }
}
