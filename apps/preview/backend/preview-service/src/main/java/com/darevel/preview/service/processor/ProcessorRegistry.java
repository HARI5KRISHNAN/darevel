package com.darevel.preview.service.processor;

import com.darevel.preview.exception.ProcessorNotFoundException;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class ProcessorRegistry {

    private final List<FileProcessor> processors;

    public ProcessorRegistry(List<FileProcessor> processors) {
        this.processors = processors;
    }

    public FileProcessor resolve(String mimeType) {
        return processors.stream()
            .filter(processor -> processor.supports(mimeType))
            .findFirst()
            .orElseThrow(() -> new ProcessorNotFoundException("No processor for " + mimeType));
    }
}
