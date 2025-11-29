package com.darevel.notification.config;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "darevel.notifications")
public class NotificationProperties {

    private Duration unreadCacheTtl = Duration.ofSeconds(30);
    private final Redis redis = new Redis();
    private final Websocket websocket = new Websocket();

    public Duration getUnreadCacheTtl() {
        return unreadCacheTtl;
    }

    public void setUnreadCacheTtl(Duration unreadCacheTtl) {
        this.unreadCacheTtl = unreadCacheTtl;
    }

    public Redis getRedis() {
        return redis;
    }

    public Websocket getWebsocket() {
        return websocket;
    }

    public static class Redis {
        private List<String> channels = new ArrayList<>();

        public List<String> getChannels() {
            return channels;
        }

        public void setChannels(List<String> channels) {
            this.channels = channels;
        }
    }

    public static class Websocket {
        private String destinationPrefix = "/topic/notifications";

        public String getDestinationPrefix() {
            return destinationPrefix;
        }

        public void setDestinationPrefix(String destinationPrefix) {
            this.destinationPrefix = destinationPrefix;
        }
    }
}
