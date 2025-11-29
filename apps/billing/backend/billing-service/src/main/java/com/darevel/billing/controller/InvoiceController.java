package com.darevel.billing.controller;

import com.darevel.billing.config.TenantResolver;
import com.darevel.billing.controller.dto.InvoiceResponse;
import com.darevel.billing.model.entity.InvoiceEntity;
import com.darevel.billing.service.InvoiceService;
import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/billing/invoices", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final TenantResolver tenantResolver;

    public InvoiceController(InvoiceService invoiceService, TenantResolver tenantResolver) {
        this.invoiceService = invoiceService;
        this.tenantResolver = tenantResolver;
    }

    @GetMapping
    public List<InvoiceResponse> listInvoices(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Org-Id", required = false) String orgHeader,
            @RequestParam(name = "orgId", required = false) UUID orgIdParam) {
        UUID orgId = orgIdParam != null ? orgIdParam : tenantResolver.resolveOrgId(jwt, orgHeader);
        return invoiceService.listInvoices(orgId).stream().map(this::toResponse).toList();
    }

    @GetMapping("/{invoiceId}")
    public InvoiceResponse getInvoice(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Org-Id", required = false) String orgHeader,
            @PathVariable UUID invoiceId) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, orgHeader);
        return toResponse(invoiceService.getInvoice(orgId, invoiceId));
    }

    private InvoiceResponse toResponse(InvoiceEntity entity) {
        return new InvoiceResponse(
                entity.getId(),
                entity.getSubscription().getId(),
                entity.getOrgId(),
                entity.getAmount(),
                entity.getCurrency(),
                entity.getStatus(),
                entity.getInvoicePdfUrl(),
                entity.getBillingPeriodStart(),
                entity.getBillingPeriodEnd(),
                entity.getCreatedAt());
    }
}
