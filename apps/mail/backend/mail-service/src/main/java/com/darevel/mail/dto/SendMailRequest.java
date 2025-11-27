package com.darevel.mail.dto;

import lombok.Data;
import java.util.List;

@Data
public class SendMailRequest {
    private List<String> to;
    private String subject;
    private String text;
    private String html;
}
