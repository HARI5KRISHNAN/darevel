package com.darevel.drive.meta.domain;

public enum PermissionLevel {
    VIEW,    // Can view and download
    EDIT,    // Can view, download, and upload new versions
    OWNER    // Full control including sharing and deletion
}
