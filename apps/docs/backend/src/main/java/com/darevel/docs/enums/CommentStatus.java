package com.darevel.docs.enums;

public enum CommentStatus {
    OPEN("Open - Active discussion"),
    RESOLVED("Resolved - Discussion completed");

    private final String description;

    CommentStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
