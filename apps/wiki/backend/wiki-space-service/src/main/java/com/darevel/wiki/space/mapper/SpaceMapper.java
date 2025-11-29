package com.darevel.wiki.space.mapper;

import com.darevel.wiki.space.domain.Space;
import com.darevel.wiki.space.domain.SpaceMember;
import com.darevel.wiki.space.dto.SpaceMemberResponse;
import com.darevel.wiki.space.dto.SpaceResponse;
import com.darevel.wiki.space.dto.SpaceSummaryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SpaceMapper {

    @Mapping(target = "memberCount", expression = "java(members.size())")
    @Mapping(target = "members", expression = "java(toMemberResponses(members))")
    SpaceResponse toResponse(Space space, List<SpaceMember> members);

    @Mapping(target = "memberCount", source = "memberCount")
    SpaceSummaryResponse toSummary(Space space, int memberCount);

    default List<SpaceMemberResponse> toMemberResponses(List<SpaceMember> members) {
        return members.stream()
            .map(this::toMemberResponse)
            .toList();
    }

    @Mapping(target = "userId", source = "userId")
    @Mapping(target = "role", expression = "java(member.getRole().name())")
    SpaceMemberResponse toMemberResponse(SpaceMember member);
}
