package com.darevel.search.config;

import com.darevel.search.consumer.SearchEventSubscriber;
import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Config;
import java.time.Duration;
import java.util.HashMap;
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
public class SearchInfrastructureConfig {

    @Bean
    public Client meilisearchClient(SearchProperties properties) {
        return new Client(new Config(properties.getMeilisearch().getHost(), properties.getMeilisearch().getApiKey()));
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory, SearchProperties properties) {
        RedisCacheConfiguration defaults = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10));

        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        cacheConfigurations.put("suggestions", defaults.entryTtl(properties.getSuggestionsCacheTtl()));
        cacheConfigurations.put("search-stats", defaults.entryTtl(Duration.ofSeconds(30)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaults)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            SearchEventSubscriber subscriber,
            SearchProperties properties) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        properties.getRedis().getChannels().forEach(channel ->
                container.addMessageListener(subscriber, ChannelTopic.of(channel)));
        return container;
    }
}
