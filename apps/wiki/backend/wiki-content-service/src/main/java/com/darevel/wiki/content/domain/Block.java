package com.darevel.wiki.content.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Represents a single content block in the editor
 * Serializable for JSONB storage in PostgreSQL
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Block implements Serializable {

    /**
     * Unique identifier for this block (UUID string)
     */
    private String id;

    /**
     * Type of block (paragraph, heading, code, etc.)
     */
    private BlockType type;

    /**
     * Block-specific properties
     * Examples:
     * - text: "Content with **bold** and *italic*"
     * - language: "java" (for code blocks)
     * - checked: true (for checkboxes)
     * - level: 1 (for headings, if needed separately)
     * - url: "https://..." (for images, videos, embeds)
     */
    @Builder.Default
    private Map<String, Object> properties = new HashMap<>();

    /**
     * Nested child blocks (for toggle lists, table rows, etc.)
     */
    @Builder.Default
    private List<Block> children = new ArrayList<>();

    /**
     * Parent block ID (for hierarchical navigation)
     * Optional, can be null for top-level blocks
     */
    private String parentId;
}
