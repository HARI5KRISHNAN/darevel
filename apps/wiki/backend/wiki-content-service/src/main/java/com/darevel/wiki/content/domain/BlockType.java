package com.darevel.wiki.content.domain;

/**
 * Supported block types for the Wiki content editor
 * Similar to Notion's block-based editor
 */
public enum BlockType {
    // Text blocks
    PARAGRAPH,
    HEADING_1,
    HEADING_2,
    HEADING_3,
    QUOTE,
    CALLOUT,

    // List blocks
    BULLET_LIST,
    NUMBERED_LIST,
    CHECKBOX,
    TOGGLE,

    // Media blocks
    IMAGE,
    VIDEO,
    FILE,
    EMBED,

    // Code blocks
    CODE,

    // Structural blocks
    DIVIDER,
    TABLE,
    TABLE_ROW,
    TABLE_OF_CONTENTS,

    // Database blocks (future)
    DATABASE,
    DATABASE_ROW
}
