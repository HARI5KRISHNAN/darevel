package com.darevel.drive.meta.service;

import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name:darevel-drive}")
    private String bucketName;

    @PostConstruct
    public void init() {
        try {
            boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucketName).build()
            );
            if (!exists) {
                minioClient.makeBucket(
                    MakeBucketArgs.builder().bucket(bucketName).build()
                );
                log.info("Created MinIO bucket: {}", bucketName);
            } else {
                log.info("MinIO bucket already exists: {}", bucketName);
            }
        } catch (Exception e) {
            log.error("Failed to initialize MinIO bucket: {}", bucketName, e);
            throw new RuntimeException("Failed to initialize MinIO bucket", e);
        }
    }

    public StorageResult uploadFile(MultipartFile file, UUID spaceId, UUID ownerId) {
        try {
            String objectKey = generateObjectKey(spaceId, ownerId, file.getOriginalFilename());
            String checksum = calculateChecksum(file.getInputStream());

            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build()
            );

            log.info("Uploaded file to MinIO: {}", objectKey);

            return new StorageResult(objectKey, file.getSize(), checksum, file.getContentType());
        } catch (Exception e) {
            log.error("Failed to upload file to MinIO", e);
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    public InputStream downloadFile(String storageKey) {
        try {
            return minioClient.getObject(
                GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(storageKey)
                    .build()
            );
        } catch (Exception e) {
            log.error("Failed to download file from MinIO: {}", storageKey, e);
            throw new RuntimeException("Failed to download file", e);
        }
    }

    public void deleteFile(String storageKey) {
        try {
            minioClient.removeObject(
                RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(storageKey)
                    .build()
            );
            log.info("Deleted file from MinIO: {}", storageKey);
        } catch (Exception e) {
            log.error("Failed to delete file from MinIO: {}", storageKey, e);
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    public long getFileSize(String storageKey) {
        try {
            var stat = minioClient.statObject(
                StatObjectArgs.builder()
                    .bucket(bucketName)
                    .object(storageKey)
                    .build()
            );
            return stat.size();
        } catch (Exception e) {
            log.error("Failed to get file size from MinIO: {}", storageKey, e);
            throw new RuntimeException("Failed to get file size", e);
        }
    }

    private String generateObjectKey(UUID spaceId, UUID ownerId, String filename) {
        String uuid = UUID.randomUUID().toString();
        String sanitizedFilename = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
        return String.format("%s/%s/%s_%s", spaceId, ownerId, uuid, sanitizedFilename);
    }

    private String calculateChecksum(InputStream inputStream) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] buffer = new byte[8192];
        int bytesRead;
        while ((bytesRead = inputStream.read(buffer)) != -1) {
            digest.update(buffer, 0, bytesRead);
        }
        inputStream.reset();
        return HexFormat.of().formatHex(digest.digest());
    }

    public record StorageResult(String storageKey, long sizeBytes, String checksum, String mimeType) {}
}
