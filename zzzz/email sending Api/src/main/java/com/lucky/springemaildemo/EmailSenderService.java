package com.lucky.springemaildemo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailSenderService {

    @Autowired
    private JavaMailSender javaMailSender;

    public void sendEmail(String to, String subject, String body) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("lucky9452rock@gmail.com");
        message.setSubject(subject);
        message.setText(body);

        javaMailSender.send(message);

        System.out.println("mail send successfully");
    }
}



