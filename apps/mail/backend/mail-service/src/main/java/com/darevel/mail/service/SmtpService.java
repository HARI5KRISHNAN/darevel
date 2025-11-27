package com.darevel.mail.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
public class SmtpService {

    private static final Logger log = LoggerFactory.getLogger(SmtpService.class);

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String from, List<String> to, String subject, String text, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(from);
            helper.setTo(to.toArray(new String[0]));
            helper.setSubject(subject != null ? subject : "(No Subject)");

            if (html != null && !html.isEmpty()) {
                helper.setText(text != null ? text : "", html);
            } else {
                helper.setText(text != null ? text : "");
            }

            mailSender.send(message);
            log.info("Email sent successfully from {} to {}", from, to);
        } catch (MessagingException e) {
            log.warn("Failed to send email via SMTP: {}. Mail saved to database only.", e.getMessage());
        } catch (Exception e) {
            log.warn("SMTP not available: {}. Mail saved to database only (development mode).", e.getMessage());
        }
    }
}
