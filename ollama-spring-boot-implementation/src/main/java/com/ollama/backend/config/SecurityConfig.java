package com.ollama.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())  // ✅ Disable CSRF
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/index.html", "/styles.css", "/script.js", "/images/**", "/static/**").permitAll()  // ✅ Allow static files
                        .requestMatchers("/api/**").permitAll() // ✅ Allow API access
                        .anyRequest().permitAll()  // ✅ Allow everything (for testing)
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // ✅ Stateless session
                .formLogin(form -> form.disable())  // ✅ Disable login form
                .httpBasic(basic -> basic.disable()); // ✅ Disable basic auth

        return http.build();
    }
}
