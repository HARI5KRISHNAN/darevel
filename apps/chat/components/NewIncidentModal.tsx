import React, { useState, useEffect } from "react";
import { FaTimes, FaExclamationTriangle, FaUser } from "react-icons/fa";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface NewIncidentModalProps {
  onClose: () => void;
  onCreateIncident: (incident: {
    title: string;
    description: string;
    severity: string;
    priority: string;
    status: string;
    category: string;
    affectedService: string;
    assignedTo: string;
    reportedBy: string;
    estimatedResolutionTime: string;
    tags: string[];
    impactedUsers: number;
    rootCause: string;
    pods?: number;
  }) => void;
  currentUser: { id: number; name: string; email: string };
}

const NewIncidentModal: React.FC<NewIncidentModalProps> = ({
  onClose,
  onCreateIncident,
  currentUser,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "medium",
    priority: "medium",
    status: "open",
    category: "technical",
    affectedService: "",
    assignedTo: "",
    reportedBy: currentUser.email,
    estimatedResolutionTime: "4h",
    impactedUsers: 0,
    rootCause: "",
    pods: 0,
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8086'}/api/auth/users`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setAvailableUsers(data.data);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.affectedService.trim()) {
      newErrors.affectedService = "Affected service is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onCreateIncident({
      ...formData,
      tags,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background-panel rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-color">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="w-6 h-6 text-accent-purple" />
            <h2 className="text-xl font-semibold text-text-primary">
              Create New Incident
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary border-b border-border-color pb-2">
                Basic Information
              </h3>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Incident Title <span className="text-status-red">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., API Gateway timeout in production"
                  className={`w-full bg-input-field p-3 rounded-md border ${
                    errors.title ? "border-status-red" : "border-border-color"
                  } text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition`}
                />
                {errors.title && (
                  <p className="text-status-red text-xs mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Description <span className="text-status-red">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide detailed description of the incident..."
                  rows={4}
                  className={`w-full bg-input-field p-3 rounded-md border ${
                    errors.description
                      ? "border-status-red"
                      : "border-border-color"
                  } text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition resize-none`}
                />
                {errors.description && (
                  <p className="text-status-red text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Row: Severity, Priority, Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Severity <span className="text-status-red">*</span>
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    className="w-full bg-input-field p-3 rounded-md border border-border-color text-text-primary focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Priority <span className="text-status-red">*</span>
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full bg-input-field p-3 rounded-md border border-border-color text-text-primary focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-input-field p-3 rounded-md border border-border-color text-text-primary focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition"
                  >
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Incident Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary border-b border-border-color pb-2">
                Incident Details
              </h3>

              {/* Row: Category, Affected Service */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-input-field p-3 rounded-md border border-border-color text-text-primary focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition"
                  >
                    <option value="technical">Technical</option>
                    <option value="security">Security</option>
                    <option value="performance">Performance</option>
                    <option value="availability">Availability</option>
                    <option value="data">Data</option>
                    <option value="network">Network</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="application">Application</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Affected Service{" "}
                    <span className="text-status-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="affectedService"
                    value={formData.affectedService}
                    onChange={handleChange}
                    placeholder="e.g., Auth Service, API Gateway"
                    className={`w-full bg-input-field p-3 rounded-md border ${
                      errors.affectedService
                        ? "border-status-red"
                        : "border-border-color"
                    } text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition`}
                  />
                  {errors.affectedService && (
                    <p className="text-status-red text-xs mt-1">
                      {errors.affectedService}
                    </p>
                  )}
                </div>
              </div>

              {/* Row: Reported By, Assigned To */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Reported By
                  </label>
                  <div className="flex items-center gap-2 bg-input-field p-3 rounded-md border border-border-color">
                    <FaUser className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-primary">
                      {currentUser.name} ({currentUser.email})
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Assign To
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full bg-input-field p-3 rounded-md border border-border-color text-text-primary focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition"
                  >
                    <option value="">Unassigned</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.email}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row: Estimated Resolution Time, Impacted Users */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Est. Resolution Time
                  </label>
                  <select
                    name="estimatedResolutionTime"
                    value={formData.estimatedResolutionTime}
                    onChange={handleChange}
                    className="w-full bg-input-field p-3 rounded-md border border-border-color text-text-primary focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition"
                  >
                    <option value="1h">1 hour</option>
                    <option value="2h">2 hours</option>
                    <option value="4h">4 hours</option>
                    <option value="8h">8 hours</option>
                    <option value="1d">1 day</option>
                    <option value="2d">2 days</option>
                    <option value="1w">1 week</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Impacted Users
                  </label>
                  <input
                    type="number"
                    name="impactedUsers"
                    value={formData.impactedUsers}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className="w-full bg-input-field p-3 rounded-md border border-border-color text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Affected Pods
                  </label>
                  <input
                    type="number"
                    name="pods"
                    value={formData.pods}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className="w-full bg-input-field p-3 rounded-md border border-border-color text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary border-b border-border-color pb-2">
                Advanced Options
              </h3>

              {/* Root Cause */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Root Cause Analysis
                </label>
                <textarea
                  name="rootCause"
                  value={formData.rootCause}
                  onChange={handleChange}
                  placeholder="Describe the root cause if known..."
                  rows={3}
                  className="w-full bg-input-field p-3 rounded-md border border-border-color text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tags (press Enter)"
                    className="flex-1 bg-input-field p-3 rounded-md border border-border-color text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-accent-purple text-white rounded-md hover:bg-accent-purple/90 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-accent-soft text-accent rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-status-red transition-colors"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border-color bg-background-main">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-background-panel text-text-primary rounded-lg hover:bg-background-panel/80 transition-colors border border-border-color"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-accent-purple text-white rounded-lg hover:bg-accent-purple/90 transition-colors font-semibold"
          >
            Create Incident
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewIncidentModal;
