package com.darevel.wiki.space.mapper;

import com.darevel.wiki.space.domain.Space;
import com.darevel.wiki.space.domain.SpaceMember;
import com.darevel.wiki.space.domain.SpaceVisibility;
import com.darevel.wiki.space.dto.SpaceMemberResponse;
import com.darevel.wiki.space.dto.SpaceResponse;
import com.darevel.wiki.space.dto.SpaceSummaryResponse;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-28T13:36:49+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.2 (Oracle Corporation)"
)
@Component
public class SpaceMapperImpl implements SpaceMapper {

    @Override
    public SpaceResponse toResponse(Space space, List<SpaceMember> members) {
        if ( space == null && members == null ) {
            return null;
        }

        UUID id = null;
        UUID ownerId = null;
        String name = null;
        String description = null;
        SpaceVisibility visibility = null;
        OffsetDateTime createdAt = null;
        OffsetDateTime updatedAt = null;
        if ( space != null ) {
            id = space.getId();
            ownerId = space.getOwnerId();
            name = space.getName();
            description = space.getDescription();
            visibility = space.getVisibility();
            createdAt = space.getCreatedAt();
            updatedAt = space.getUpdatedAt();
        }

        int memberCount = members.size();
        List<SpaceMemberResponse> members1 = toMemberResponses(members);

        SpaceResponse spaceResponse = new SpaceResponse( id, ownerId, name, description, visibility, memberCount, createdAt, updatedAt, members1 );

        return spaceResponse;
    }

    @Override
    public SpaceSummaryResponse toSummary(Space space, int memberCount) {
        if ( space == null ) {
            return null;
        }

        UUID id = null;
        UUID ownerId = null;
        String name = null;
        String description = null;
        SpaceVisibility visibility = null;
        OffsetDateTime updatedAt = null;
        if ( space != null ) {
            id = space.getId();
            ownerId = space.getOwnerId();
            name = space.getName();
            description = space.getDescription();
            visibility = space.getVisibility();
            updatedAt = space.getUpdatedAt();
        }
        int memberCount1 = 0;
        memberCount1 = memberCount;

        SpaceSummaryResponse spaceSummaryResponse = new SpaceSummaryResponse( id, ownerId, name, description, visibility, memberCount1, updatedAt );

        return spaceSummaryResponse;
    }

    @Override
    public SpaceMemberResponse toMemberResponse(SpaceMember member) {
        if ( member == null ) {
            return null;
        }

        UUID userId = null;

        userId = member.getUserId();

        String role = member.getRole().name();

        SpaceMemberResponse spaceMemberResponse = new SpaceMemberResponse( userId, role );

        return spaceMemberResponse;
    }
}
