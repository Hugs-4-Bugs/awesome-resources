package com.lucky.springemaildemo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class SpringemaildemoApplication {
       @Autowired
	   private EmailSenderService senderService;
	public static void main(String[] args) {

		SpringApplication.run(SpringemaildemoApplication.class, args);
	}

	@EventListener(ApplicationReadyEvent.class)

	public void sendMail(){

		senderService.sendEmail("lucky9452rock@gmail.com","this is subject","my name is ashish I " +
				"possess comprehensive proficiency in Tally, a leading accounting software " +
				"renowned for its user-friendly interface and robust financial management capabilities." +
				" With hands-on experience in leveraging Tally's features, I have " +
				"effectively streamlined accounting processes, enhanced accuracy, " +
				"and facilitated efficient financial reporting");
	}

}
