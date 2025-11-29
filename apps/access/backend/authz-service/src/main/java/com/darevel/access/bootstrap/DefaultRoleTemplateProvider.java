package com.darevel.access.bootstrap;

import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class DefaultRoleTemplateProvider {

    public List<RoleTemplate> getTemplates() {
        return List.of(
                new RoleTemplate(
                        "workspace-admin",
                        "Workspace Admin",
                        "Full access to every workspace capability.",
                        10,
                        true,
                        List.of(
                                "docs.read",
                                "docs.write",
                                "docs.comment",
                                "docs.share",
                                "wiki.read",
                                "wiki.write",
                                "wiki.manage",
                                "storage.read",
                                "storage.upload",
                                "storage.delete",
                                "admin.users",
                                "admin.roles",
                                "admin.billing")),
                new RoleTemplate(
                        "workspace-editor",
                        "Workspace Editor",
                        "Create and collaborate on Docs, Wiki, and Storage.",
                        20,
                        true,
                        List.of(
                                "docs.read",
                                "docs.write",
                                "docs.comment",
                                "wiki.read",
                                "wiki.write",
                                "storage.read",
                                "storage.upload")),
                new RoleTemplate(
                        "workspace-viewer",
                        "Workspace Viewer",
                        "Read-only access across modules.",
                        30,
                        true,
                        List.of("docs.read", "wiki.read", "storage.read")));
    }
}
