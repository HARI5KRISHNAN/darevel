import React, { useState } from "react";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaChartBar,
  FaList,
} from "react-icons/fa";
import NewIncidentModal from "../components/NewIncidentModal";

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low" | "critical";
  status: "open" | "acknowledged" | "resolved" | "investigating";
  timestamp: string;
  pods?: number;
  priority?: string;
  category?: string;
  affectedService?: string;
  assignedTo?: string;
  reportedBy?: string;
  estimatedResolutionTime?: string;
  tags?: string[];
  impactedUsers?: number;
  rootCause?: string;
}

interface IncidentsPageProps {
  currentUser?: { id: number; name: string; email: string };
}

const IncidentsPage: React.FC<IncidentsPageProps> = ({ currentUser }) => {
  const [view, setView] = useState<"list" | "analytics">("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);
  const [isNewIncidentModalOpen, setIsNewIncidentModalOpen] = useState(false);

  // Sample incidents data
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: "1",
      title: "API auth failure in production pod",
      description: "Auth tokens expired unexpectedly.",
      severity: "high",
      status: "open",
      timestamp: "11/20/2025, 4:45:00 PM",
      pods: 3,
    },
    {
      id: "2",
      title: "Scheduled deploy rollback",
      description: "Rollback caused by DB migration issue.",
      severity: "medium",
      status: "open",
      timestamp: "11/19/2025, 3:00:00 PM",
    },
  ]);

  const openIncidents = incidents.filter((i) => i.status === "open").length;
  const highSeverity = incidents.filter((i) => i.severity === "high").length;

  const filteredIncidents = incidents.filter((incident) => {
    const statusMatch =
      statusFilter === "all" || incident.status === statusFilter;
    const severityMatch =
      severityFilter === "all" || incident.severity === severityFilter;
    return statusMatch && severityMatch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-status-red/10 text-status-red border-status-red/20";
      case "medium":
        return "bg-tag-orange-soft text-tag-orange border-tag-orange/20";
      case "low":
        return "bg-accent-soft text-accent border-accent/20";
      default:
        return "bg-background-panel text-text-secondary border-border-color";
    }
  };

  const toggleIncidentDetails = (id: string) => {
    setExpandedIncident(expandedIncident === id ? null : id);
  };

  const handleCreateIncident = (incidentData: any) => {
    const newIncident: Incident = {
      id: Date.now().toString(),
      title: incidentData.title,
      description: incidentData.description,
      severity: incidentData.severity,
      status: incidentData.status,
      timestamp: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      pods: incidentData.pods || 0,
      priority: incidentData.priority,
      category: incidentData.category,
      affectedService: incidentData.affectedService,
      assignedTo: incidentData.assignedTo,
      reportedBy: incidentData.reportedBy,
      estimatedResolutionTime: incidentData.estimatedResolutionTime,
      tags: incidentData.tags,
      impactedUsers: incidentData.impactedUsers,
      rootCause: incidentData.rootCause,
    };

    setIncidents((prev) => [newIncident, ...prev]);
  };

  return (
    <div className="w-full h-full p-6 bg-background-main text-text-primary flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FaExclamationTriangle className="w-6 h-6 text-accent-purple" />
          Incident Dashboard
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              view === "list"
                ? "bg-accent-purple text-white"
                : "bg-background-panel text-text-secondary hover:bg-background-panel/80"
            }`}
          >
            <FaList className="inline w-4 h-4 mr-2" />
            List
          </button>
          <button
            onClick={() => setView("analytics")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              view === "analytics"
                ? "bg-accent-purple text-white"
                : "bg-background-panel text-text-secondary hover:bg-background-panel/80"
            }`}
          >
            <FaChartBar className="inline w-4 h-4 mr-2" />
            Analytics
          </button>
        </div>
      </div>

      {view === "list" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6 flex-shrink-0">
            <div className="bg-background-panel p-4 rounded-xl border border-border-color/50">
              <div className="text-text-secondary text-sm mb-1">
                Open incidents
              </div>
              <div className="text-3xl font-bold text-text-primary">
                {openIncidents}
              </div>
              <div className="text-text-secondary text-xs mt-1">
                Active pods: {incidents[0]?.pods || 0}
              </div>
            </div>
            <div className="bg-background-panel p-4 rounded-xl border border-border-color/50">
              <div className="text-text-secondary text-sm mb-1">
                High severity
              </div>
              <div className="text-3xl font-bold text-text-primary">
                {highSeverity}
              </div>
              <div className="text-status-red text-xs mt-1">
                Critical problems
              </div>
            </div>
            <div className="bg-background-panel p-4 rounded-xl border border-border-color/50">
              <div className="text-text-secondary text-sm mb-1">Progress</div>
              <div className="w-full bg-background-main rounded-full h-2 mt-2 mb-1">
                <div
                  className="bg-accent-purple h-2 rounded-full"
                  style={{ width: "25%" }}
                ></div>
              </div>
              <div className="text-text-secondary text-xs mt-1">ETA Friday</div>
            </div>
          </div>

          {/* Filters and New Incident Button */}
          <div className="flex gap-3 mb-4 flex-shrink-0">
            <div className="text-lg font-semibold text-text-primary flex items-center">
              Vulnerabilities / Incidents
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-input-field px-3 py-2 rounded-md border border-border-color text-sm text-text-primary focus:ring-accent focus:border-accent transition"
            >
              <option value="all">All status</option>
              <option value="open">Open</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-input-field px-3 py-2 rounded-md border border-border-color text-sm text-text-primary focus:ring-accent focus:border-accent transition"
            >
              <option value="all">All severity</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button
              onClick={() => setIsNewIncidentModalOpen(true)}
              className="ml-auto px-4 py-2 bg-accent-purple text-white rounded-lg text-sm font-semibold hover:bg-accent-purple/90 transition-colors"
            >
              New Incident
            </button>
          </div>

          {/* Incidents List */}
          <div className="bg-background-panel rounded-xl border border-border-color/50 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto p-4">
              {filteredIncidents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                  <FaCheckCircle className="w-16 h-16 mb-4 opacity-50" />
                  <div className="text-xl font-semibold mb-2">
                    No incidents recorded yet
                  </div>
                  <div className="text-sm">Your pods are running smoothly</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredIncidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="bg-background-main rounded-lg border border-border-color/30 overflow-hidden"
                    >
                      <div className="p-4 flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-base font-semibold text-text-primary">
                              {incident.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                                incident.severity
                              )}`}
                            >
                              {incident.severity}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary">
                            {incident.description}
                          </p>
                        </div>
                        <div className="text-sm text-text-secondary flex items-center gap-2">
                          <FaClock className="w-3 h-3" />
                          {incident.timestamp}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleIncidentDetails(incident.id)}
                            className="px-3 py-1 bg-background-panel text-text-primary rounded text-sm hover:bg-accent-soft transition-colors border border-border-color"
                          >
                            Details
                          </button>
                          <button className="px-3 py-1 bg-accent-purple text-white rounded text-sm hover:bg-accent-purple/90 transition-colors">
                            Acknowledge
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedIncident === incident.id && (
                        <div className="px-4 pb-4 border-t border-border-color/30 pt-4 bg-background-panel/30">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-text-secondary">
                                Status:
                              </span>{" "}
                              <span className="text-text-primary font-medium capitalize">
                                {incident.status}
                              </span>
                            </div>
                            <div>
                              <span className="text-text-secondary">
                                Severity:
                              </span>{" "}
                              <span className="text-text-primary font-medium capitalize">
                                {incident.severity}
                              </span>
                            </div>
                            <div>
                              <span className="text-text-secondary">
                                Reported:
                              </span>{" "}
                              <span className="text-text-primary">
                                {incident.timestamp}
                              </span>
                            </div>
                            {incident.pods && (
                              <div>
                                <span className="text-text-secondary">
                                  Affected Pods:
                                </span>{" "}
                                <span className="text-text-primary">
                                  {incident.pods}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="mt-4">
                            <div className="text-text-secondary text-sm mb-2">
                              Additional Information:
                            </div>
                            <p className="text-text-primary text-sm">
                              {incident.description} This incident requires
                              immediate attention to prevent service disruption.
                              Follow the standard incident response protocol.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {view === "analytics" && (
        <div className="flex-1 flex flex-col gap-6 overflow-auto">
          {/* Analytics Header */}
          <div className="flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-semibold text-text-primary">
              Incident Analytics
            </h2>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-2 gap-6 flex-shrink-0">
            {/* Status Distribution - Bar Chart */}
            <div className="bg-background-panel p-6 rounded-xl border border-border-color/50">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Status Distribution
              </h3>
              <div className="space-y-4">
                {(() => {
                  const statusCounts = {
                    open: incidents.filter((i) => i.status === "open").length,
                    acknowledged: incidents.filter(
                      (i) => i.status === "acknowledged"
                    ).length,
                    resolved: incidents.filter((i) => i.status === "resolved")
                      .length,
                  };
                  const maxCount = Math.max(
                    ...Object.values(statusCounts),
                    1
                  );

                  return Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize text-text-primary font-medium">
                          {status}
                        </span>
                        <span className="text-text-secondary">{count}</span>
                      </div>
                      <div className="w-full bg-background-main rounded-full h-4">
                        <div
                          className={`h-4 rounded-full transition-all ${
                            status === "open"
                              ? "bg-status-red"
                              : status === "acknowledged"
                              ? "bg-tag-orange"
                              : "bg-status-green"
                          }`}
                          style={{
                            width: `${(count / maxCount) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Severity Distribution - Bar Chart */}
            <div className="bg-background-panel p-6 rounded-xl border border-border-color/50">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Severity Distribution
              </h3>
              <div className="space-y-4">
                {(() => {
                  const severityCounts = {
                    high: incidents.filter((i) => i.severity === "high").length,
                    medium: incidents.filter((i) => i.severity === "medium")
                      .length,
                    low: incidents.filter((i) => i.severity === "low").length,
                  };
                  const maxCount = Math.max(
                    ...Object.values(severityCounts),
                    1
                  );

                  return Object.entries(severityCounts).map(
                    ([severity, count]) => (
                      <div key={severity} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize text-text-primary font-medium">
                            {severity}
                          </span>
                          <span className="text-text-secondary">{count}</span>
                        </div>
                        <div className="w-full bg-background-main rounded-full h-4">
                          <div
                            className={`h-4 rounded-full transition-all ${
                              severity === "high"
                                ? "bg-status-red"
                                : severity === "medium"
                                ? "bg-tag-orange"
                                : "bg-accent-purple"
                            }`}
                            style={{
                              width: `${(count / maxCount) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )
                  );
                })()}
              </div>
            </div>

            {/* Incidents Timeline - Line Chart */}
            <div className="bg-background-panel p-6 rounded-xl border border-border-color/50 col-span-2">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Incidents Over Time
              </h3>
              <div className="relative h-64">
                <div className="absolute inset-0 flex items-end justify-around gap-2">
                  {[
                    { day: "Mon", count: 0 },
                    { day: "Tue", count: 0 },
                    { day: "Wed", count: 1 },
                    { day: "Thu", count: 1 },
                    { day: "Fri", count: 2 },
                    { day: "Sat", count: 0 },
                    { day: "Sun", count: 0 },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="w-full flex items-end justify-center h-48">
                        {item.count > 0 && (
                          <div
                            className="w-full bg-accent-purple rounded-t-lg transition-all hover:bg-accent-purple/80"
                            style={{
                              height: `${(item.count / 2) * 100}%`,
                              minHeight: "20px",
                            }}
                          ></div>
                        )}
                      </div>
                      <div className="text-xs text-text-secondary font-medium">
                        {item.day}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Severity by Status - Stacked View */}
            <div className="bg-background-panel p-6 rounded-xl border border-border-color/50 col-span-2">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Severity by Status
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {["open", "acknowledged", "resolved"].map((status) => {
                  const statusIncidents = incidents.filter(
                    (i) => i.status === status
                  );
                  const high = statusIncidents.filter(
                    (i) => i.severity === "high"
                  ).length;
                  const medium = statusIncidents.filter(
                    (i) => i.severity === "medium"
                  ).length;
                  const low = statusIncidents.filter(
                    (i) => i.severity === "low"
                  ).length;
                  const total = statusIncidents.length;

                  return (
                    <div
                      key={status}
                      className="bg-background-main p-4 rounded-lg border border-border-color/30"
                    >
                      <div className="text-sm font-semibold text-text-primary capitalize mb-3">
                        {status}
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-status-red">● High</span>
                          <span className="text-text-primary font-medium">
                            {high}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-tag-orange">● Medium</span>
                          <span className="text-text-primary font-medium">
                            {medium}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-accent-purple">● Low</span>
                          <span className="text-text-primary font-medium">
                            {low}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border-color/30">
                          <span className="text-text-secondary font-semibold">
                            Total
                          </span>
                          <span className="text-text-primary font-bold">
                            {total}
                          </span>
                        </div>
                      </div>
                      {/* Mini stacked bar */}
                      {total > 0 && (
                        <div className="mt-3 w-full bg-background-panel rounded-full h-2 flex overflow-hidden">
                          {high > 0 && (
                            <div
                              className="bg-status-red h-2"
                              style={{
                                width: `${(high / total) * 100}%`,
                              }}
                            ></div>
                          )}
                          {medium > 0 && (
                            <div
                              className="bg-tag-orange h-2"
                              style={{
                                width: `${(medium / total) * 100}%`,
                              }}
                            ></div>
                          )}
                          {low > 0 && (
                            <div
                              className="bg-accent-purple h-2"
                              style={{
                                width: `${(low / total) * 100}%`,
                              }}
                            ></div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-background-panel p-6 rounded-xl border border-border-color/50">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Summary Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm">
                    Total Incidents
                  </span>
                  <span className="text-2xl font-bold text-text-primary">
                    {incidents.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm">
                    Open Issues
                  </span>
                  <span className="text-2xl font-bold text-status-red">
                    {incidents.filter((i) => i.status === "open").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm">
                    Critical (High)
                  </span>
                  <span className="text-2xl font-bold text-status-red">
                    {incidents.filter((i) => i.severity === "high").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm">
                    Resolution Rate
                  </span>
                  <span className="text-2xl font-bold text-status-green">
                    {incidents.length > 0
                      ? Math.round(
                          (incidents.filter((i) => i.status === "resolved")
                            .length /
                            incidents.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Average Response Time */}
            <div className="bg-background-panel p-6 rounded-xl border border-border-color/50">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Response Metrics
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-text-secondary text-sm mb-1">
                    Avg. Response Time
                  </div>
                  <div className="text-3xl font-bold text-accent-purple">
                    2.4h
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary text-sm mb-1">
                    Avg. Resolution Time
                  </div>
                  <div className="text-3xl font-bold text-text-primary">
                    18.5h
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary text-sm mb-1">
                    Active Pods Affected
                  </div>
                  <div className="text-3xl font-bold text-tag-orange">
                    {incidents.reduce((sum, i) => sum + (i.pods || 0), 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Incident Modal */}
      {isNewIncidentModalOpen && currentUser && (
        <NewIncidentModal
          onClose={() => setIsNewIncidentModalOpen(false)}
          onCreateIncident={handleCreateIncident}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default IncidentsPage;
