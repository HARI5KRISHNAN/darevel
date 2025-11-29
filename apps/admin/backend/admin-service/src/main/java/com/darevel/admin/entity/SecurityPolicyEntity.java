package com.darevel.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "security_policies")
public class SecurityPolicyEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "org_id", nullable = false, unique = true)
    private UUID orgId;

    @Column(name = "mfa_required")
    private boolean mfaRequired;

    @Column(name = "password_min_length")
    private int passwordMinLength;

    @Column(name = "password_requires_special")
    private boolean passwordRequiresSpecial;

    @Column(name = "password_requires_number")
    private boolean passwordRequiresNumber;

    @Column(name = "session_timeout_minutes")
    private int sessionTimeoutMinutes;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "allowed_ip_ranges", columnDefinition = "text[]")
    private List<String> allowedIpRanges = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getOrgId() {
        return orgId;
    }

    public void setOrgId(UUID orgId) {
        this.orgId = orgId;
    }

    public boolean isMfaRequired() {
        return mfaRequired;
    }

    public void setMfaRequired(boolean mfaRequired) {
        this.mfaRequired = mfaRequired;
    }

    public int getPasswordMinLength() {
        return passwordMinLength;
    }

    public void setPasswordMinLength(int passwordMinLength) {
        this.passwordMinLength = passwordMinLength;
    }

    public boolean isPasswordRequiresSpecial() {
        return passwordRequiresSpecial;
    }

    public void setPasswordRequiresSpecial(boolean passwordRequiresSpecial) {
        this.passwordRequiresSpecial = passwordRequiresSpecial;
    }

    public boolean isPasswordRequiresNumber() {
        return passwordRequiresNumber;
    }

    public void setPasswordRequiresNumber(boolean passwordRequiresNumber) {
        this.passwordRequiresNumber = passwordRequiresNumber;
    }

    public int getSessionTimeoutMinutes() {
        return sessionTimeoutMinutes;
    }

    public void setSessionTimeoutMinutes(int sessionTimeoutMinutes) {
        this.sessionTimeoutMinutes = sessionTimeoutMinutes;
    }

    public List<String> getAllowedIpRanges() {
        return allowedIpRanges;
    }

    public void setAllowedIpRanges(List<String> allowedIpRanges) {
        this.allowedIpRanges = allowedIpRanges;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
