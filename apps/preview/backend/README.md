# preview-service design

Spring Boot microservice responsible for turning raw uploads (PDF, DOCX, PPTX, XLSX, images, videos) into embeddable preview artifacts that the new React UI consumes. This document captures the backend design before implementation.

## Goals & scope
- Generate normalized preview payloads (text, thumbnails, structured metadata) for every supported file type.
- Cache heavy artifacts (converted pages, video storyboards) in MinIO/S3 while tracking metadata in Postgres.
- Expose REST APIs under `/api/preview/**` for browsing previews, initiating generation, polling status, and retrieving AI-ready summaries/snippets.
- Enforce organization-level access via JWT bearer tokens issued by the suite identity provider.
- Run background workers to (a) convert newly uploaded files, (b) refresh stale previews, and (c) purge expired cache objects.

## Tech stack
- Java 17 / Spring Boot 3.2 (same baseline as other services).
- Maven module: `apps/preview/backend/preview-service` (to be added to the parent POM after scaffolding).
- Persistence: PostgreSQL schema `preview_cache` (managed with Flyway) plus Redis (optional) for hot metadata caching.
- Object storage: MinIO (dev) or S3 (prod) for page images, slide thumbnails, extracted text blobs, and transcoded video segments.
- File processing libraries:
  - PDFs: Apache PDFBox + pdfbox-tools for rendering pages.
  - DOCX/PPTX/XLSX: Apache POI, POI-Scratchpad, docx4j for HTML extraction.
  - Images: Thumbnailator + metadata-extractor.
  - Videos: FFmpeg CLI invoked via `net.bramp.ffmpeg` wrapper for keyframes + HLS renditions.
  - Plain text / fallbacks: Apache Tika.
- Messaging / job orchestration: Spring Batch + PostgreSQL job repository; optional hand-off via Spring Events for lightweight tasks.
- Observability: Spring Actuator, Micrometer with Prometheus labels `preview_type`, `processor`, `status`.

## Module & package layout
```
preview-service
├─ pom.xml (inherits darevel-suite-parent)
├─ src/main/java/com/darevel/preview
│  ├─ PreviewServiceApplication.java
│  ├─ config/
│  │    ├─ StorageConfig.java (S3/MinIO clients)
│  │    ├─ SecurityConfig.java (JWT resource server)
│  │    ├─ ProcessorConfig.java (bean wiring for converters)
│  │    └─ SchedulingConfig.java
│  ├─ controller/
│  │    ├─ PreviewFileController.java (CRUD + status endpoints)
│  │    └─ PreviewArtifactController.java (streaming assets)
│  ├─ dto/
│  ├─ entity/
│  ├─ mapper/
│  ├─ repository/
│  ├─ service/
│  │    ├─ PreviewFileService.java (core orchestration)
│  │    ├─ ProcessorRegistry.java (selects processor per mime)
│  │    ├─ processors/* (PdfProcessor, DocxProcessor, etc.)
│  │    └─ StorageService.java (MinIO wrapper)
│  ├─ jobs/
│  │    ├─ PreviewGenerationJob.java
│  │    └─ CacheWarmupJob.java
│  └─ security/
│       ├─ JwtClaimsResolver.java
│       └─ AccessEvaluator.java
└─ src/main/resources/
   ├─ application.yml
   └─ db/migration/V1__init.sql
```

## Database schema (schema: `preview_cache`)
| Table | Purpose |
| --- | --- |
| `preview_files` | Row per uploaded logical file (id, org_id, owner_id, mime_type, size_bytes, sha256, storage_url, status, failure_reason, last_generated_at, ttl_at, created_at, updated_at). |
| `preview_artifacts` | Child rows referencing `preview_files.id` describing generated artifacts (type = PAGE_IMAGE, TEXT_JSON, VIDEO_STORYBOARD, etc., storage_key, byte_size, checksum, metadata JSONB). |
| `preview_jobs` | Background processing metadata (job_id, file_id, job_type, attempt, status, started_at, finished_at, worker_node, error_stack). |

All tables include optimistic locking (`version`) and audit columns. Index on `(org_id, status)` to support Drive/Docs filtering.

## Storage layout (MinIO / S3)
```
preview-artifacts/
  {orgId}/
    {fileId}/
      source/{originalFilename}
      pages/page-{n}.png
      text/content.json
      slides/{n}.png
      video/storyboard-{n}.jpg
      video/hls/{bitrate}/segment.ts
```
Bucket lifecycle rules expire `pages/*` and `video/*` after configurable TTL; metadata remains in Postgres.

## REST API surface
1. `POST /api/preview/files`
   - Body: `{ sourceUrl | uploadId, filename, mimeType, sizeBytes }`
   - Action: registers file, enqueues generation job, returns `PreviewFileResponse`.
2. `GET /api/preview/files?status=READY&orgId=...`
   - Pagination for listing.
3. `GET /api/preview/files/{id}`
   - Returns details + artifact summaries (without large payloads).
4. `GET /api/preview/files/{id}/artifacts/{artifactId}`
   - Either redirects (302) to pre-signed S3 URL or streams bytes via proxy for small artifacts (≤ 5 MB).
5. `POST /api/preview/files/{id}/regenerate`
   - Forces reprocessing (invalidates artifacts + queue job).
6. `GET /api/preview/files/{id}/insights`
   - Returns extracted outline + highlights + AI summary (generated via Gemini or on-prem LLM). Backend will call Gemini using a service key so the frontend no longer needs direct access.

Swagger/OpenAPI powered by `springdoc-openapi` for discoverability.

## Processing pipeline
1. **Ingestion**: Controller validates JWT → stores metadata → pushes `PreviewJobPayload` to Spring Batch job table.
2. **Dispatcher**: `ProcessorRegistry` picks a processor implementation per mime group.
3. **Processor**: Streams the source object from Drive/Blob store, writes derived artifacts to MinIO, and stores metadata rows.
4. **Post-processing**: Extracted text chunked and fed to Gemini `gemini-2.5-flash` using a service account; results stored in `preview_artifacts` (`type=AI_SUMMARY`).
5. **Cache/Ttl**: TTL watchers mark rows as `EXPIRED`; scheduled job refreshes them, while cleanup job deletes orphaned artifacts.

Failure handling: each job can retry up to 3 times with exponential backoff. Failures update `preview_files.status = FAILED` and capture `failure_reason` for UI badges.

## Background jobs & schedulers
- `PreviewGenerationJob`: chunked reader scans `preview_files` where status=`QUEUED` and dispatches processors.
- `CacheWarmupJob` (hourly): recalculates previews for hot files requested in the past N hours but nearing expiration.
- `ArtifactCleanupJob` (daily): deletes MinIO objects for files marked `DELETED` or expired > 30 days.
- `VideoTranscodeWatcher`: monitors long-running FFmpeg processes and updates job progress percentages used by `/status` endpoint.

## Security & governance
- OAuth2 resource server validating JWTs signed by Darevel identity provider; scopes: `preview.read`, `preview.write`.
- Fine-grained access using `org_id` + `subject` claim mapped to `owner_id`; service supports `X-Darevel-App` header for machine-to-machine calls from Drive/Wiki modules.
- Binary artifact URLs generated via time-bound pre-signed URLs with path-style keys; never expose raw MinIO credentials to clients.

## Observability
- Metrics: `preview_jobs_total{status,type}`, `preview_processing_duration_seconds{processor}`, `preview_artifact_size_bytes{type}`.
- Logs: JSON format with correlation ids pulled from `X-Request-Id`.
- Health checks: `/actuator/health`, `/actuator/prometheus`, `/actuator/info`.

## Implementation plan
1. **Scaffold service** (pom, main class, configs, Flyway baseline, Docker compose override for Postgres + MinIO).
2. **Core domain** (entities, repositories, DTOs, mapping helpers, list/detail endpoints).
3. **Processor MVP**: implement PDF + DOCX, store rendered PNG + HTML/text; wire to background job.
4. **Expand processors**: PPTX, XLSX, images, video (ffmpeg) with progress reporting.
5. **AI insights endpoint**: integrate Gemini API via service key, persist summaries to avoid repeat costing.
6. **Operational polish**: caching, cleanup jobs, tests, load/perf tuning.

This plan aligns with the previously shared requirements (Postgres metadata, MinIO caching, document/video processors, JWT security, scheduled workers). Next step is scaffolding `preview-service` following this blueprint.
