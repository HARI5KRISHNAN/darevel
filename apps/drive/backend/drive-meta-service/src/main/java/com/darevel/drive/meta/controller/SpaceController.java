package com.darevel.drive.meta.controller;

import com.darevel.drive.meta.domain.SpaceType;
import com.darevel.drive.meta.dto.CreateSpaceRequest;
import com.darevel.drive.meta.dto.SpaceResponse;
import com.darevel.drive.meta.service.SpaceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drive/spaces")
@RequiredArgsConstructor
@Validated
public class SpaceController {

    private final SpaceService spaceService;

    @PostMapping
    public ResponseEntity<SpaceResponse> createSpace(@Valid @RequestBody CreateSpaceRequest request) {
        SpaceResponse response = spaceService.createSpace(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<SpaceResponse> listSpaces(
        @RequestParam(required = false) UUID ownerId,
        @RequestParam(required = false) SpaceType type
    ) {
        if (ownerId != null) {
            return spaceService.listSpacesForOwner(ownerId);
        }
        if (type != null) {
            return spaceService.listSpacesByType(type);
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Specify ownerId or type to filter spaces");
    }

    @GetMapping("/{spaceId}")
    public SpaceResponse getSpace(@PathVariable @NotNull UUID spaceId) {
        return spaceService.getSpaceDetails(spaceId);
    }
}
