package com.darevel.preview.service.processor;

import com.darevel.preview.entity.PreviewFileEntity;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PdfFileProcessor implements FileProcessor {

    private static final Logger log = LoggerFactory.getLogger(PdfFileProcessor.class);

    @Override
    public boolean supports(String mimeType) {
        return mimeType != null && mimeType.equalsIgnoreCase("application/pdf");
    }

    @Override
    public ProcessorResult process(PreviewFileEntity file) {
        log.info("Processing PDF {}", file.getId());
        // Placeholder metadata until the rendering pipeline is implemented.
        return new ProcessorResult(Map.of(
            "pageCount", 1,
            "textPreview", "PDF preview generation not yet implemented"
        ));
    }
}
