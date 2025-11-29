package com.darevel.access.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class RolePermissionId implements Serializable {

    @Column(name = "role_id")
    private UUID roleId;

    @Column(name = "permission_code", length = 120)
    private String permissionCode;

    public RolePermissionId() {
    }

    public RolePermissionId(UUID roleId, String permissionCode) {
        this.roleId = roleId;
        this.permissionCode = permissionCode;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RolePermissionId that)) return false;
        return Objects.equals(roleId, that.roleId) && Objects.equals(permissionCode, that.permissionCode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(roleId, permissionCode);
    }
}
