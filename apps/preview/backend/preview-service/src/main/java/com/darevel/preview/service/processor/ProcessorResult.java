package com.darevel.preview.service.processor;

import java.util.Map;

public class ProcessorResult {

    private final Map<String, Object> metadata;

    public ProcessorResult(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public Map<String, Object> metadata() {
        return metadata;
    }
}
