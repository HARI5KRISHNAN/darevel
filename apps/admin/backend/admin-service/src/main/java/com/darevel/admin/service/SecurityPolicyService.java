package com.darevel.admin.service;

import com.darevel.admin.dto.SecurityPolicyRequest;
import com.darevel.admin.dto.SecurityPolicyResponse;
import com.darevel.admin.entity.SecurityPolicyEntity;
import com.darevel.admin.exception.ResourceNotFoundException;
import com.darevel.admin.repository.SecurityPolicyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SecurityPolicyService {

    private final SecurityPolicyRepository repository;

    public SecurityPolicyService(SecurityPolicyRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public SecurityPolicyResponse getPolicy(UUID orgId) {
        SecurityPolicyEntity entity = repository.findByOrgId(orgId)
            .orElseThrow(() -> new ResourceNotFoundException("Security policy not configured"));
        return map(entity);
    }

    @Transactional
    public SecurityPolicyResponse upsertPolicy(UUID orgId, SecurityPolicyRequest request) {
        SecurityPolicyEntity entity = repository.findByOrgId(orgId).orElseGet(SecurityPolicyEntity::new);
        entity.setOrgId(orgId);
        entity.setMfaRequired(request.mfaRequired());
        entity.setPasswordMinLength(request.passwordMinLength());
        entity.setPasswordRequiresSpecial(request.passwordRequiresSpecial());
        entity.setPasswordRequiresNumber(request.passwordRequiresNumber());
        entity.setSessionTimeoutMinutes(request.sessionTimeoutMinutes());
        List<String> ipRanges = request.allowedIpRanges() == null ? List.of() : request.allowedIpRanges();
        entity.setAllowedIpRanges(ipRanges);
        SecurityPolicyEntity saved = repository.save(entity);
        return map(saved);
    }

    private SecurityPolicyResponse map(SecurityPolicyEntity entity) {
        return new SecurityPolicyResponse(
            entity.getOrgId(),
            entity.isMfaRequired(),
            entity.getPasswordMinLength(),
            entity.isPasswordRequiresSpecial(),
            entity.isPasswordRequiresNumber(),
            entity.getSessionTimeoutMinutes(),
            entity.getAllowedIpRanges(),
            entity.getUpdatedAt()
        );
    }
}
