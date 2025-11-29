package com.darevel.preview.service.processor;

import com.darevel.preview.entity.PreviewFileEntity;
import java.util.Map;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class DefaultNoopProcessor implements FileProcessor {

    @Override
    public boolean supports(String mimeType) {
        return true;
    }

    @Override
    public ProcessorResult process(PreviewFileEntity file) {
        return new ProcessorResult(Map.of("message", "No processor implemented yet"));
    }
}
