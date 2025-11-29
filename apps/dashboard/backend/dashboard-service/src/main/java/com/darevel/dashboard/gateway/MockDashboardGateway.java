package com.darevel.dashboard.gateway;

import com.darevel.dashboard.context.DashboardRequestContext;
import com.darevel.dashboard.dto.ActivitySeriesDto;
import com.darevel.dashboard.dto.CalendarEventDto;
import com.darevel.dashboard.dto.DocumentDto;
import com.darevel.dashboard.dto.EmailDto;
import com.darevel.dashboard.dto.OrgDashboardResponse;
import com.darevel.dashboard.dto.OrgStatDto;
import com.darevel.dashboard.dto.PersonalDashboardResponse;
import com.darevel.dashboard.dto.StorageDto;
import com.darevel.dashboard.dto.TaskDto;
import com.darevel.dashboard.dto.TeamDashboardResponse;
import com.darevel.dashboard.dto.UserSummaryDto;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
public class MockDashboardGateway implements DownstreamDashboardGateway {

    private final Clock clock;

    public MockDashboardGateway(Clock clock) {
        this.clock = clock;
    }

    @Override
    public PersonalDashboardResponse fetchPersonalSummary(DashboardRequestContext context) {
        UserSummaryDto primaryUser = toUserSummary(context.userId(), context.userDisplayName(), "ADMIN");
        return new PersonalDashboardResponse(
                personalTasks(primaryUser),
                personalEvents(),
                personalEmails(),
                personalDocuments(primaryUser.name()),
                buildGreeting(context.userDisplayName())
        );
    }

    @Override
    public TeamDashboardResponse fetchTeamSummary(DashboardRequestContext context) {
        UserSummaryDto leader = toUserSummary(context.userId(), context.userDisplayName(), "ADMIN");
        List<UserSummaryDto> members = List.of(
                leader,
                new UserSummaryDto("c9a92fd3-48d5-4d74-91ec-8cf63c55d870", "Sarah Cooper", "https://picsum.photos/id/32/200/200", "MANAGER"),
                new UserSummaryDto("371fc9a0-1c31-41c2-badc-4a25143edcba", "Mike Ross", "https://picsum.photos/id/55/200/200", "USER")
        );

        return new TeamDashboardResponse(
                context.teamName(),
                teamSprintTasks(members.get(2)),
                upcomingDeadlines(),
                members,
                teamDocuments()
        );
    }

    @Override
    public OrgDashboardResponse fetchOrgSummary(DashboardRequestContext context) {
        return new OrgDashboardResponse(
                orgStats(),
                storageUsage(),
                activitySeries(),
                recentSignups()
        );
    }

    private List<TaskDto> personalTasks(UserSummaryDto primaryUser) {
        return List.of(
                new TaskDto("t1", "Review Q3 Financial Reports", "IN_PROGRESS", "HIGH", "Today", primaryUser),
                new TaskDto("t2", "Update Dashboard Widget API", "TODO", "MEDIUM", "Tomorrow", primaryUser),
                new TaskDto("t3", "Finalize Hiring Plan", "DONE", "HIGH", "Yesterday", null),
                new TaskDto("t4", "Prepare Town Hall Slides", "IN_PROGRESS", "MEDIUM", "Thu", null)
        );
    }

    private List<CalendarEventDto> personalEvents() {
        return List.of(
                new CalendarEventDto("e1", "Product Sync", "10:00 AM", "11:00 AM", 5, "MEETING"),
                new CalendarEventDto("e2", "Design Review", "01:30 PM", "02:30 PM", 3, "MEETING"),
                new CalendarEventDto("e3", "Focus Time", "03:00 PM", "05:00 PM", 1, "FOCUS")
        );
    }

    private List<EmailDto> personalEmails() {
        return List.of(
                new EmailDto("m1", "Project Alpha Update", "Sarah Connor", "https://picsum.photos/id/32/200/200", "Here are the latest metrics from the...", "10m ago", true),
                new EmailDto("m2", "New Policy Changes", "HR Team", null, "Please review the attached handbook...", "1h ago", true),
                new EmailDto("m3", "Lunch?", "Mike Ross", "https://picsum.photos/id/55/200/200", "Are we still on for tacos today?", "2h ago", false)
        );
    }

    private List<DocumentDto> personalDocuments(String author) {
        return List.of(
                new DocumentDto("d1", "Q3 Marketing Strategy", "DOC", "2h ago", author),
                new DocumentDto("d2", "Budget 2024_v2", "SHEET", "1d ago", "Finance"),
                new DocumentDto("d3", "All Hands Deck", "SLIDE", "3d ago", "Sarah Connor")
        );
    }

    private List<TaskDto> teamSprintTasks(UserSummaryDto assignee) {
        return List.of(
                new TaskDto("tt1", "Ship collaborative editing", "IN_PROGRESS", "HIGH", "EOW", assignee),
                new TaskDto("tt2", "QA dashboard filters", "IN_PROGRESS", "MEDIUM", "Fri", null),
                new TaskDto("tt3", "Stabilize Redis cluster", "TODO", "HIGH", "Thu", null)
        );
    }

    private List<TaskDto> upcomingDeadlines() {
        return List.of(
                new TaskDto("td1", "Billing service rollout", "IN_PROGRESS", "HIGH", "Tomorrow", null),
                new TaskDto("td2", "Security posture review", "TODO", "MEDIUM", "Mon", null)
        );
    }

    private List<DocumentDto> teamDocuments() {
        return List.of(
                new DocumentDto("tdoc1", "Engineering KPI Tracker", "SHEET", "4h ago", "Ops"),
                new DocumentDto("tdoc2", "Sprint 42 Retro", "DOC", "1d ago", "Product"),
                new DocumentDto("tdoc3", "North Star Roadmap", "SLIDE", "2d ago", "Leadership")
        );
    }

    private List<OrgStatDto> orgStats() {
        return List.of(
                new OrgStatDto("Total Users", "1,240", 12.5, "up"),
                new OrgStatDto("Active Projects", "86", 5.2, "up"),
                new OrgStatDto("Storage Used", "4.2 TB", 8.1, "up"),
                new OrgStatDto("Avg. Response Time", "1.2h", -2.4, "down")
        );
    }

    private List<StorageDto> storageUsage() {
        return List.of(new StorageDto(45, 100, "TB"));
    }

    private List<ActivitySeriesDto> activitySeries() {
        return List.of(
                new ActivitySeriesDto("Mon", 400, 240, 240),
                new ActivitySeriesDto("Tue", 300, 139, 221),
                new ActivitySeriesDto("Wed", 200, 980, 229),
                new ActivitySeriesDto("Thu", 278, 390, 200),
                new ActivitySeriesDto("Fri", 189, 480, 218),
                new ActivitySeriesDto("Sat", 239, 380, 250),
                new ActivitySeriesDto("Sun", 349, 430, 210)
        );
    }

    private List<UserSummaryDto> recentSignups() {
        return List.of(
                new UserSummaryDto("498c255f-9bc4-4a63-9fc1-5f227157e7ad", "Priya R", "https://picsum.photos/id/1027/200/200", "USER"),
                new UserSummaryDto("b4bbd5ef-9c91-4fe0-900b-2512b1f161d2", "Jordan P", "https://picsum.photos/id/1005/200/200", "MANAGER")
        );
    }

    private String buildGreeting(String displayName) {
        LocalDateTime now = LocalDateTime.now(clock);
        int hour = now.getHour();
        String prefix;
        if (hour < 12) {
            prefix = "Good morning";
        } else if (hour < 18) {
            prefix = "Good afternoon";
        } else {
            prefix = "Good evening";
        }
        return prefix + ", " + firstName(displayName);
    }

    private String firstName(String displayName) {
        if (!StringUtils.hasText(displayName)) {
            return "there";
        }
        return displayName.split("\\s+")[0];
    }

    private UserSummaryDto toUserSummary(UUID id, String name, String role) {
        String avatar = "https://api.dicebear.com/7.x/initials/svg?seed=" + (StringUtils.hasText(name) ? name.replace(' ', '+') : "user");
        return new UserSummaryDto(id.toString(), name, avatar, role);
    }
}
