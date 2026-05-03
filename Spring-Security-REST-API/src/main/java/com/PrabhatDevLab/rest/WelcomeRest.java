package com.PrabhatDevLab.rest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WelcomeRest {

	@GetMapping("/welcome")
	public String getMsg() {
		String msg = "Welcome to Prabhat's DevLab";
		return msg;
	}

}
