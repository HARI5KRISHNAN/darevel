package com.darevel.preview.service.processor;

import com.darevel.preview.entity.PreviewFileEntity;

public interface FileProcessor {

    boolean supports(String mimeType);

    ProcessorResult process(PreviewFileEntity file);
}
