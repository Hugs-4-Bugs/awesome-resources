package emailtwailio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication(scanBasePackages = "emailtwailio")

public class EmailTwilioApplication {

	public static void main(String[] args) {
		SpringApplication.run(EmailTwilioApplication.class, args);
	}

}
