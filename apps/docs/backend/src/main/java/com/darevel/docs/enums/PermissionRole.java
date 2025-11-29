package com.darevel.docs.enums;

public enum PermissionRole {
    OWNER("Owner - Full control"),
    EDIT("Editor - Can edit and comment"),
    COMMENT("Commenter - Can view and comment"),
    VIEW("Viewer - Can only view");

    private final String description;

    PermissionRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public boolean canEdit() {
        return this == OWNER || this == EDIT;
    }

    public boolean canComment() {
        return this == OWNER || this == EDIT || this == COMMENT;
    }

    public boolean canManagePermissions() {
        return this == OWNER;
    }

    public boolean canDelete() {
        return this == OWNER;
    }
}
