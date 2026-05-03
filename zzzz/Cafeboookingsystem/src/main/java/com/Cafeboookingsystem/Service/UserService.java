package com.Cafeboookingsystem.Service;

import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface UserService {

    ResponseEntity<String>signup(Map<String, String> requestmap);

    ResponseEntity<String> login(Map<String, String> requestmap);

}
