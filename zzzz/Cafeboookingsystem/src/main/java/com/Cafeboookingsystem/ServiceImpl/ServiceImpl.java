package com.Cafeboookingsystem.ServiceImpl;

import com.Cafeboookingsystem.Constant.UserConstant;
import com.Cafeboookingsystem.JWT.CustomerUsersDetailsService;
import com.Cafeboookingsystem.JWT.JwtUtil;
import com.Cafeboookingsystem.Service.UserService;
import com.Cafeboookingsystem.Utils.CafeUtils;
import com.Cafeboookingsystem.Entity.User;
import com.Cafeboookingsystem.Respository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
public class ServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomerUsersDetailsService customerUsersDetailsService;

    @Autowired

    private PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtil jwtUtil;

    @Override
    public ResponseEntity<String> signup(Map<String, String> requestmap) {
        log.info("Inside signup{}", requestmap);
        try {
            if (validateSignUpMap(requestmap)) {
                User user = userRepository.findByEmail(requestmap.get("email"));
                if (Objects.isNull(user)) {
                    userRepository.save(getUserFromMap(requestmap));
                    return CafeUtils.getResponseEntity("Registered successfully", HttpStatus.OK);
                } else {
                    return CafeUtils.getResponseEntity("Email already exists.", HttpStatus.BAD_REQUEST);
                }
            } else {
                return CafeUtils.getResponseEntity(UserConstant.INVALID_DATA, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return CafeUtils.getResponseEntity(UserConstant.SOMETHING_WENT_WRONG, HttpStatus.BAD_REQUEST);
    }

    private boolean validateSignUpMap(Map<String, String> requestmap) {
        return requestmap.containsKey("name") && requestmap.containsKey("contactNumber")
                && requestmap.containsKey("email") && requestmap.containsKey("password");
    }

    private User getUserFromMap(Map<String, String> requestmap) {
        User user = new User();
        user.setName(requestmap.get("name"));
        user.setContactNumber(requestmap.get("contactNumber"));
        user.setEmail(requestmap.get("email"));
        user.setPassword(passwordEncoder.encode(requestmap.get("password")));
        user.setStatus("true");
        user.setRole("user");
        return user;
    }

    @Override
    public ResponseEntity<String> login(Map<String, String> requestmap) {
        log.info("Inside login");
        try {
            // Find the user by email
            User user = userRepository.findByEmail(requestmap.get("email"));

            // Check if user exists and password matches
            if (user != null && passwordEncoder.matches(requestmap.get("password"), user.getPassword())) {
                // Authenticate user using authentication manager
                Authentication auth = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(requestmap.get("email"), requestmap.get("password"))
                );

                if (auth.isAuthenticated()) {
                    if (user.getStatus().equalsIgnoreCase("true")) {

                        // Generate JWT token for authenticated user
                        return new ResponseEntity<>("{\"token\":\"" +
                                jwtUtil.generateToken(user.getEmail(), user.getRole()) +
                                "\"}", HttpStatus.OK);
                    } else {
                        return new ResponseEntity<>("{\"message\":\"wait for admin approval.\"}", HttpStatus.BAD_REQUEST);
                    }
                }
            }
        } catch (Exception ex) {
            log.error("Login error: {}", ex.getMessage());
        }

        return new ResponseEntity<>("{\"message\":\"BAD Credentials.\"}", HttpStatus.BAD_REQUEST);
    }
}