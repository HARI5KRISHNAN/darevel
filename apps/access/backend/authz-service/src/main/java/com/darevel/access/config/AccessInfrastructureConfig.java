package com.darevel.access.config;

import java.time.Duration;
import java.util.Map;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

@Configuration
@EnableCaching
public class AccessInfrastructureConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory, AccessProperties properties) {
        RedisCacheConfiguration defaults = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(5));

        Map<String, RedisCacheConfiguration> caches = Map.of(
                "permissions",
                defaults.entryTtl(properties.getPermissionCacheTtl()),
                "assignments",
                defaults.entryTtl(properties.getAssignmentCacheTtl()));

        return RedisCacheManager.builder(factory)
                .cacheDefaults(defaults)
                .withInitialCacheConfigurations(caches)
                .build();
    }

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
                // Listeners/topics will be registered once Redis consumers are implemented
        return container;
    }
}
