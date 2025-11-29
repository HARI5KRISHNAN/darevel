package com.darevel.workflow.shared.messaging;

public final class KafkaTopics {
    private KafkaTopics() {}

    public static final String WORKFLOW_TRIGGERS = "workflow.triggers";
    public static final String WORKFLOW_EXECUTIONS = "workflow.executions";
    public static final String WORKFLOW_RUN_STATUS = "workflow.run-status";
    public static final String WORKFLOW_AUDIT = "workflow.audit";
}
