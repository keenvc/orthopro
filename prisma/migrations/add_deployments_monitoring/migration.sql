-- CreateTable
CREATE TABLE "deployments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "health_check_url" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'render',
    "repository_url" TEXT,
    "branch" TEXT NOT NULL DEFAULT 'main',
    "status" TEXT NOT NULL DEFAULT 'unknown',
    "last_deployed_at" TIMESTAMPTZ,
    "last_health_check" TIMESTAMPTZ,
    "health_status" TEXT NOT NULL DEFAULT 'unknown',
    "environment" TEXT NOT NULL DEFAULT 'production',
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deployments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployment_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "deployment_id" UUID NOT NULL,
    "log_type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deployment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployment_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "deployment_id" UUID NOT NULL,
    "stat_date" DATE NOT NULL,
    "uptime_percentage" DECIMAL(5,2),
    "response_time_ms" INTEGER,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "total_requests" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deployment_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deployments_name_key" ON "deployments"("name");

-- CreateIndex
CREATE INDEX "deployments_name_idx" ON "deployments"("name");

-- CreateIndex
CREATE INDEX "deployments_status_idx" ON "deployments"("status");

-- CreateIndex
CREATE INDEX "deployments_health_status_idx" ON "deployments"("health_status");

-- CreateIndex
CREATE INDEX "deployments_last_deployed_at_idx" ON "deployments"("last_deployed_at");

-- CreateIndex
CREATE INDEX "deployment_logs_deployment_id_idx" ON "deployment_logs"("deployment_id");

-- CreateIndex
CREATE INDEX "deployment_logs_log_type_idx" ON "deployment_logs"("log_type");

-- CreateIndex
CREATE INDEX "deployment_logs_created_at_idx" ON "deployment_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "deployment_stats_deployment_id_stat_date_key" ON "deployment_stats"("deployment_id", "stat_date");

-- CreateIndex
CREATE INDEX "deployment_stats_deployment_id_idx" ON "deployment_stats"("deployment_id");

-- CreateIndex
CREATE INDEX "deployment_stats_stat_date_idx" ON "deployment_stats"("stat_date");

-- AddForeignKey
ALTER TABLE "deployment_logs" ADD CONSTRAINT "deployment_logs_deployment_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "deployments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployment_stats" ADD CONSTRAINT "deployment_stats_deployment_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "deployments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
