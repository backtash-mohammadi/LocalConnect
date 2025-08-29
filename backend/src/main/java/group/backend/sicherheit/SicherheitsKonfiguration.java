package group.backend.sicherheit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SicherheitsKonfiguration {

    private final JwtFilter jwtFilter;

    @Value("${app.cors.erlaubteUrspruenge:http://localhost:5173}")
    private String erlaubteUrspruenge;

    public SicherheitsKonfiguration(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    // === Password-Encoder
    @Bean
    public PasswordEncoder passwortEncoder() {
        return new BCryptPasswordEncoder(); // {bcrypt}
    }

    // === DaoAuthenticationProvider
    @Bean
    public AuthenticationProvider authProvider(
            UserDetailsService benutzerDetailsDienst,
            PasswordEncoder passwortEncoder
    ) {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider();
        p.setUserDetailsService(benutzerDetailsDienst);
        p.setPasswordEncoder(passwortEncoder);
        return p;
    }

    // === AuthenticationManager
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }


    @Bean
    public SecurityFilterChain sicherheitsFilterKette(HttpSecurity http,
                                                      AuthenticationProvider authProvider) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsKonfiguration()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/comments/**").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/comments/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/erstellen").permitAll()
                        .requestMatchers("/meine-anfragen").permitAll()
                        .requestMatchers("/anfrage/**").permitAll()
                        .requestMatchers("stadt-anfragen").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/geocode/**").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/registrieren",
                                "/api/auth/registrieren/bestaetigen",
                                "/api/auth/login/start",
                                "/api/auth/login/bestaetigen",
                                "/api/auth/login/code-erneut"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authProvider)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private CorsConfigurationSource corsKonfiguration() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(erlaubteUrspruenge.split(",")));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization","Content-Type"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
