package com.darevel.search.service;

import com.darevel.search.config.SearchProperties;
import com.darevel.search.dto.ReindexRequest;
import com.darevel.search.dto.ReindexResponse;
import com.darevel.search.model.SearchContext;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReindexService {

    private final SearchProperties properties;

    public ReindexResponse triggerReindex(ReindexRequest request, SearchContext context) {
        List<String> documentTypes = resolveDocumentTypes(request);
        long queued = (long) request.workspaceIds().size() * documentTypes.size();

        log.info("User {} requested reindex for workspaces {} and types {}", context.userId(), request.workspaceIds(), documentTypes);
        dispatchAsyncJob(request.workspaceIds(), documentTypes, context);

        return new ReindexResponse("QUEUED", Instant.now(), request.workspaceIds(), documentTypes, queued);
    }

    @Async
    protected void dispatchAsyncJob(List<String> workspaceIds, List<String> documentTypes, SearchContext context) {
        // Placeholder for future ingestion fan-out via Redis or Task queue
        log.debug("Dispatching background reindex for {} workspaces by {}", workspaceIds.size(), context.userId());
    }

    private List<String> resolveDocumentTypes(ReindexRequest request) {
        if (CollectionUtils.isEmpty(request.documentTypes())) {
            return properties.getIngestion().getAllowedTypes();
        }
        return request.documentTypes();
    }
}
