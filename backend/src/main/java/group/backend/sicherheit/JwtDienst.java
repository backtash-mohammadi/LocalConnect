package group.backend.sicherheit;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;


import javax.crypto.SecretKey;
import java.util.Date;


@Component
public class JwtDienst {


    private final SecretKey geheimnisSchluessel;
    private final long ablaufMillis;


    public JwtDienst(
            @Value("${app.jwt.geheimnis}") String geheimnis,
            @Value("${app.jwt.ablaufMillis}") long ablaufMillis) {
        this.geheimnisSchluessel = Keys.hmacShaKeyFor(geheimnis.getBytes());
        this.ablaufMillis = ablaufMillis;
    }


    public String erzeugeToken(UserDetails details) {
        Date jetzt = new Date();
        Date ablauf = new Date(jetzt.getTime() + ablaufMillis);


        return Jwts.builder()
                .setSubject(details.getUsername())
                .setIssuedAt(jetzt)
                .setExpiration(ablauf)
                .signWith(geheimnisSchluessel, SignatureAlgorithm.HS256)
                .compact();
    }


    public String extrahiereBenutzername(String token) {
        return extrahiereAlleAnsprueche(token).getSubject();
    }


    public boolean istTokenGueltig(String token, UserDetails details) {
        String name = extrahiereBenutzername(token);
        Date exp = extrahiereAlleAnsprueche(token).getExpiration();
        return name.equals(details.getUsername()) && exp.after(new Date());
    }


    private Claims extrahiereAlleAnsprueche(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(geheimnisSchluessel)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
