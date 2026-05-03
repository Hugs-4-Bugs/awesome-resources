package com.stripe.stripepayment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("com.stripe.stripepayment.entity")
@EnableJpaRepositories("com.stripe.stripepayment.repository")
public class StripepaymentApplication {

	public static void main(String[] args) {
		SpringApplication.run(StripepaymentApplication.class, args);
	}

}
