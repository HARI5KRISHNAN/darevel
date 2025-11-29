package com.darevel.drive.meta.mapper;

import com.darevel.drive.meta.domain.DriveSpace;
import com.darevel.drive.meta.domain.SpaceType;
import com.darevel.drive.meta.dto.SpaceResponse;
import java.time.OffsetDateTime;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-28T15:07:49+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.2 (Oracle Corporation)"
)
@Component
public class DriveMapperImpl implements DriveMapper {

    @Override
    public SpaceResponse toSpaceResponse(DriveSpace space) {
        if ( space == null ) {
            return null;
        }

        UUID id = null;
        UUID ownerId = null;
        String name = null;
        SpaceType type = null;
        OffsetDateTime createdAt = null;
        OffsetDateTime updatedAt = null;

        id = space.getId();
        ownerId = space.getOwnerId();
        name = space.getName();
        type = space.getType();
        createdAt = space.getCreatedAt();
        updatedAt = space.getUpdatedAt();

        SpaceResponse spaceResponse = new SpaceResponse( id, ownerId, name, type, createdAt, updatedAt );

        return spaceResponse;
    }
}
