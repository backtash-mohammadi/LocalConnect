package group.backend.sicherheit;

import group.backend.benutzer.Benutzer;
import group.backend.benutzer.BenutzerRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BenutzerDetailsDienst implements UserDetailsService {
    private final BenutzerRepository benutzerRepository;
    private final Set<String> adminEmails;

    public BenutzerDetailsDienst(BenutzerRepository benutzerRepository,
                                 @Value("${app.admin.emails:}") String adminEmailsKonfig) {
        this.benutzerRepository = benutzerRepository;
        this.adminEmails = Arrays.stream(Optional.ofNullable(adminEmailsKonfig).orElse("").split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toSet());
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Benutzer b = benutzerRepository.findByEmailAdresse(email)
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden"));

        List<GrantedAuthority> rollen = new ArrayList<>();
        rollen.add(new SimpleGrantedAuthority("ROLE_USER"));
        if (adminEmails.contains(b.getEmailAdresse().toLowerCase())) {
            rollen.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        return org.springframework.security.core.userdetails.User
                .withUsername(b.getEmailAdresse())
                .password(b.getPasswortHash())
                .authorities(rollen)
                .build();
    }
}
