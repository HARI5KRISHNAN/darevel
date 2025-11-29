package com.darevel.wiki.space.controller;

import com.darevel.wiki.space.domain.SpaceVisibility;
import com.darevel.wiki.space.dto.AddSpaceMemberRequest;
import com.darevel.wiki.space.dto.CreateSpaceRequest;
import com.darevel.wiki.space.dto.SpaceMemberResponse;
import com.darevel.wiki.space.dto.SpaceResponse;
import com.darevel.wiki.space.dto.SpaceSummaryResponse;
import com.darevel.wiki.space.dto.UpdateSpaceMemberRoleRequest;
import com.darevel.wiki.space.dto.UpdateSpaceRequest;
import com.darevel.wiki.space.service.SpaceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wiki/spaces")
@RequiredArgsConstructor
@Validated
public class SpaceController {

    private final SpaceService spaceService;

    @PostMapping
    public ResponseEntity<SpaceResponse> createSpace(@Valid @RequestBody CreateSpaceRequest request) {
        SpaceResponse response = spaceService.createSpace(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{spaceId}")
    public SpaceResponse getSpace(@PathVariable UUID spaceId) {
        return spaceService.getSpace(spaceId);
    }

    @GetMapping("/key/{spaceKey}")
    public SpaceResponse getSpaceByKey(@PathVariable String spaceKey) {
        return spaceService.getSpaceByKey(spaceKey);
    }

    @GetMapping
    public List<SpaceSummaryResponse> querySpaces(
        @RequestParam(required = false) UUID ownerId,
        @RequestParam(required = false) SpaceVisibility visibility
    ) {
        if (ownerId != null) {
            return spaceService.findSpacesForOwner(ownerId);
        }
        if (visibility != null) {
            return spaceService.findSpacesByVisibility(visibility);
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Specify ownerId or visibility to query spaces");
    }

    @PutMapping("/{spaceId}")
    public SpaceResponse updateSpace(@PathVariable UUID spaceId, @Valid @RequestBody UpdateSpaceRequest request) {
        return spaceService.updateSpace(spaceId, request);
    }

    @DeleteMapping("/{spaceId}")
    public ResponseEntity<Void> deleteSpace(@PathVariable UUID spaceId) {
        spaceService.deleteSpace(spaceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{spaceId}/members")
    public List<SpaceMemberResponse> listMembers(@PathVariable UUID spaceId) {
        return spaceService.listMembers(spaceId);
    }

    @PostMapping("/{spaceId}/members")
    public ResponseEntity<SpaceMemberResponse> addMember(
        @PathVariable UUID spaceId,
        @Valid @RequestBody AddSpaceMemberRequest request
    ) {
        SpaceMemberResponse response = spaceService.addMember(spaceId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{spaceId}/members/{userId}")
    public SpaceMemberResponse updateMemberRole(
        @PathVariable UUID spaceId,
        @PathVariable UUID userId,
        @Valid @RequestBody UpdateSpaceMemberRoleRequest request
    ) {
        return spaceService.updateMemberRole(spaceId, userId, request);
    }

    @DeleteMapping("/{spaceId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
        @PathVariable UUID spaceId,
        @PathVariable @NotNull UUID userId
    ) {
        spaceService.removeMember(spaceId, userId);
        return ResponseEntity.noContent().build();
    }
}
