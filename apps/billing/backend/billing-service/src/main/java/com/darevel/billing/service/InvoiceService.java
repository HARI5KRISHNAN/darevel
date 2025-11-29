package com.darevel.billing.service;

import com.darevel.billing.config.BillingProperties;
import com.darevel.billing.model.entity.InvoiceEntity;
import com.darevel.billing.model.entity.SubscriptionEntity;
import com.darevel.billing.model.enums.InvoiceStatus;
import com.darevel.billing.repository.InvoiceRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final SubscriptionService subscriptionService;
    private final BillingProperties properties;

    public List<InvoiceEntity> listInvoices(UUID orgId) {
        return invoiceRepository.findByOrgIdOrderByCreatedAtDesc(orgId);
    }

    public InvoiceEntity getInvoice(UUID orgId, UUID invoiceId) {
        InvoiceEntity invoice = invoiceRepository
            .findDetailedById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found"));
        if (!invoice.getOrgId().equals(orgId)) {
            throw new EntityNotFoundException("Invoice not found for org");
        }
        return invoice;
    }

    @Transactional
    public InvoiceEntity recordInvoice(
            UUID orgId,
            Integer amount,
            InvoiceStatus status,
            OffsetDateTime periodStart,
            OffsetDateTime periodEnd,
            String externalPdfUrl) {
        SubscriptionEntity subscription = subscriptionService.getSubscription(orgId);
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setSubscription(subscription);
        invoice.setOrgId(orgId);
        invoice.setAmount(amount);
        invoice.setCurrency(properties.getDefaults().getCurrency());
        invoice.setStatus(status);
        invoice.setInvoicePdfUrl(externalPdfUrl);
        invoice.setBillingPeriodStart(periodStart);
        invoice.setBillingPeriodEnd(periodEnd);
        return invoiceRepository.save(invoice);
    }
}
