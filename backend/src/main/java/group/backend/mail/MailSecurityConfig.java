package group.backend.mail;
// group/backend/mail/MailSecurityConfig.java

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class MailSecurityConfig {

    @Bean
    @Order(1) // check this chain first
    SecurityFilterChain mailChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher("/api/mail/**")                 // only for /api/mail/**
                .cors(c -> {})                                   // enable CORS here
                .csrf(csrf -> csrf.disable())                    // no CSRF for this simple POST
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/api/mail/**").permitAll() // preflight
                        .requestMatchers(HttpMethod.POST, "/api/mail/test").permitAll()
                        .anyRequest().denyAll()
                )
                .build();
    }
}
