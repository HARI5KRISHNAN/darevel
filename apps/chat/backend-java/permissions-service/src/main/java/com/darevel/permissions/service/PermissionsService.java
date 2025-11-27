package com.darevel.permissions.service;

import com.darevel.permissions.dto.PermissionUpdateRequest;
import com.darevel.permissions.dto.PermissionUpdateResponse;
import com.darevel.permissions.model.Member;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class PermissionsService {

    // Explicit logger
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PermissionsService.class);

    private static final List<String> VALID_TOOLS = Arrays.asList("jenkins", "kubernetes", "docker", "git");
    private static final List<String> VALID_ACCESS_LEVELS = Arrays.asList("read", "write", "execute");

    // In-memory member storage (replace with database in production)
    private final List<Member> members = new ArrayList<>(Arrays.asList(
            new Member(1L, "George Lindelof", "carlsen@armand.no", "Active", "Admin"),
            new Member(2L, "Eric Dyer", "cristofer.ajer@ione.no", "Active", "Editor"),
            new Member(3L, "Haitam Alissami", "haitam@gmail.com", "Active", "Viewer"),
            new Member(4L, "Michael Campbel", "camp@hotmail.com", "Inactive", "Viewer"),
            new Member(5L, "Ashley Williams", "williams.ash@newt.com", "Active", "Editor"),
            new Member(6L, "Vanessa Paradi", "paradi.van@google.com", "Active", "Viewer")
    ));

    private final AtomicLong memberIdCounter = new AtomicLong(6L);

    public PermissionUpdateResponse updatePermission(PermissionUpdateRequest request) throws Exception {
        long startTime = System.currentTimeMillis();

        // Validate inputs
        if (!VALID_TOOLS.contains(request.getTool())) {
            throw new IllegalArgumentException("Invalid tool. Must be one of: " + String.join(", ", VALID_TOOLS));
        }

        if (!VALID_ACCESS_LEVELS.contains(request.getAccess())) {
            throw new IllegalArgumentException("Invalid access level. Must be one of: " + String.join(", ", VALID_ACCESS_LEVELS));
        }

        // Build paths (using relative paths similar to Node.js version)
        String playbookPath = "src/ansible/playbooks/" + request.getTool() + ".yml";
        String inventoryPath = "src/ansible/inventory.ini";

        // Check if playbook exists
        if (!new File(playbookPath).exists()) {
            throw new Exception("Playbook not found: " + request.getTool() + ".yml");
        }

        // Check if inventory exists
        if (!new File(inventoryPath).exists()) {
            throw new Exception("Ansible inventory not found. Please configure inventory.ini");
        }

        // Build Ansible command with extra vars
        StringBuilder extraVars = new StringBuilder("user=" + request.getEmail() + " access=" + request.getAccess());

        if ("kubernetes".equals(request.getTool())) {
            extraVars.append(" namespace=").append(request.getNamespace());
        }

        if ("git".equals(request.getTool())) {
            extraVars.append(" git_repo=").append(request.getGitRepo())
                    .append(" git_server_type=").append(request.getGitServerType());
        }

        String command = String.format("ansible-playbook -i \"%s\" \"%s\" --extra-vars \"%s\"",
                inventoryPath, playbookPath, extraVars);

        log.info("🔧 Executing Ansible playbook: {}.yml", request.getTool());
        log.info("📝 User: {} ({})", request.getUser(), request.getEmail());
        log.info("🔑 Access: {}", request.getAccess());
        log.info("👤 Executor: {}", request.getExecutor());

        // Execute Ansible playbook
        String output = executeCommand(command, 120000); // 2 minutes timeout

        long executionTime = System.currentTimeMillis() - startTime;

        log.info("✅ Successfully updated permissions for {} on {}", request.getUser(), request.getTool());

        // Create response
        PermissionUpdateResponse response = new PermissionUpdateResponse();
        response.setUser(request.getUser());
        response.setEmail(request.getEmail());
        response.setTool(request.getTool());
        response.setAccess(request.getAccess());
        response.setExecutor(request.getExecutor());
        response.setTimestamp(LocalDateTime.now());
        response.setExecutionTime(executionTime + "ms");
        response.setOutput(output);

        return response;
    }

    public List<Member> getMembers() {
        return new ArrayList<>(members);
    }

    public Member updateMemberRole(Long id, String role) {
        if (!Arrays.asList("Admin", "Editor", "Viewer").contains(role)) {
            throw new IllegalArgumentException("Invalid role. Must be Admin, Editor, or Viewer");
        }

        Optional<Member> memberOpt = members.stream()
                .filter(m -> m.getId().equals(id))
                .findFirst();

        if (memberOpt.isEmpty()) {
            throw new RuntimeException("Member not found");
        }

        Member member = memberOpt.get();
        member.setRole(role);

        return member;
    }

    public Member addMember(String name, String email, String role) {
        // Check if email already exists
        boolean exists = members.stream()
                .anyMatch(m -> m.getEmail().equals(email));

        if (exists) {
            throw new RuntimeException("Member with this email already exists");
        }

        Long newId = memberIdCounter.incrementAndGet();
        Member newMember = new Member(newId, name, email, "Active", role != null ? role : "Viewer");
        members.add(newMember);

        return newMember;
    }

    public Member deleteMember(Long id) {
        Optional<Member> memberOpt = members.stream()
                .filter(m -> m.getId().equals(id))
                .findFirst();

        if (memberOpt.isEmpty()) {
            throw new RuntimeException("Member not found");
        }

        Member member = memberOpt.get();
        members.remove(member);

        return member;
    }

    public boolean checkAnsibleStatus() {
        try {
            executeCommand("ansible --version", 5000);
            return true;
        } catch (Exception e) {
            log.error("Ansible is not available", e);
            return false;
        }
    }

    public String getAnsibleVersion() throws Exception {
        String output = executeCommand("ansible --version", 5000);
        return output.split("\n")[0];
    }

    private String executeCommand(String command, long timeout) throws Exception {
        Process process = Runtime.getRuntime().exec(new String[]{"sh", "-c", command});

        StringBuilder output = new StringBuilder();
        StringBuilder error = new StringBuilder();

        // Read output
        Thread outputThread = new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            } catch (Exception e) {
                log.error("Error reading output", e);
            }
        });

        // Read error
        Thread errorThread = new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    error.append(line).append("\n");
                }
            } catch (Exception e) {
                log.error("Error reading error stream", e);
            }
        });

        outputThread.start();
        errorThread.start();

        boolean finished = process.waitFor(timeout, TimeUnit.MILLISECONDS);

        outputThread.join();
        errorThread.join();

        if (!finished) {
            process.destroy();
            throw new Exception("Ansible execution timed out (exceeded " + (timeout / 1000) + " seconds)");
        }

        if (process.exitValue() != 0) {
            throw new Exception("Ansible execution failed: " + error);
        }

        return output.toString();
    }
}
