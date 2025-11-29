package com.darevel.preview.service;

import com.darevel.preview.config.properties.StorageProperties;
import com.darevel.preview.exception.StorageException;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
import java.io.InputStream;
import java.util.concurrent.TimeUnit;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StorageService {

    private final MinioClient minioClient;
    private final StorageProperties storageProperties;

    public StorageService(MinioClient minioClient, StorageProperties storageProperties) {
        this.minioClient = minioClient;
        this.storageProperties = storageProperties;
    }

    public void upload(String key, MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            PutObjectArgs args = PutObjectArgs.builder()
                .bucket(storageProperties.getBucket())
                .object(key)
                .stream(inputStream, file.getSize(), -1)
                .contentType(file.getContentType())
                .build();
            minioClient.putObject(args);
        } catch (Exception ex) {
            throw new StorageException("Failed to upload object", ex);
        }
    }

    public String presign(String key, int minutes) {
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                .method(Method.GET)
                .bucket(storageProperties.getBucket())
                .object(key)
                .expiry(minutes, TimeUnit.MINUTES)
                .build());
        } catch (Exception ex) {
            throw new StorageException("Failed to generate URL", ex);
        }
    }
}
