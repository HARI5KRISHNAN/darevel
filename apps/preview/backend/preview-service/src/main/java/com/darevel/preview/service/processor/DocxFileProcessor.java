package com.darevel.preview.service.processor;

import com.darevel.preview.entity.PreviewFileEntity;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class DocxFileProcessor implements FileProcessor {

    private static final Logger log = LoggerFactory.getLogger(DocxFileProcessor.class);

    @Override
    public boolean supports(String mimeType) {
        return mimeType != null && (mimeType.equalsIgnoreCase("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
            || mimeType.equalsIgnoreCase("application/msword"));
    }

    @Override
    public ProcessorResult process(PreviewFileEntity file) {
        log.info("Processing DOCX {}", file.getId());
        return new ProcessorResult(Map.of(
            "htmlPreview", "<p>DOCX preview generation not yet implemented</p>",
            "wordCount", 0
        ));
    }
}
