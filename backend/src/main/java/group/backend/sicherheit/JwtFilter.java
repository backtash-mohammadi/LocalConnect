package group.backend.sicherheit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;


import java.io.IOException;


@Component
public class JwtFilter extends OncePerRequestFilter {


    private final JwtDienst jwtDienst;
    private final BenutzerDetailsDienst benutzerDetailsDienst;


    public JwtFilter(JwtDienst jwtDienst, BenutzerDetailsDienst benutzerDetailsDienst) {
        this.jwtDienst = jwtDienst;
        this.benutzerDetailsDienst = benutzerDetailsDienst;
    }


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {


        final String authHeader = request.getHeader("Authorization");
        String email = null;
        String token = null;


        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                email = jwtDienst.extrahiereBenutzername(token);
            } catch (Exception ignored) {}
        }


        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails details = benutzerDetailsDienst.loadUserByUsername(email);
            if (jwtDienst.istTokenGueltig(token, details)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        details, null, details.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }


        filterChain.doFilter(request, response);
    }
}
