package com.darevel.chat.repository;

import com.darevel.chat.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByChannelIdOrderByTimestampAsc(String channelId);

    void deleteByChannelId(String channelId);
}
