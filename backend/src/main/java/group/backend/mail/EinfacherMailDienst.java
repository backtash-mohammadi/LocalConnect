package group.backend.mail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EinfacherMailDienst implements MailDienst {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@localconnect.test}")
    private String absender;

    @Override
    public void sende(String an, String betreff, String text) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(absender);
            msg.setTo(an);
            msg.setSubject(betreff);
            msg.setText(text);
            mailSender.send(msg);
            log.info("E-Mail gesendet an {} (Betreff='{}')", an, betreff);
        } catch (Exception e) {
            log.error("E-Mail Versand fehlgeschlagen: {}", e.getMessage(), e);
        }
    }
}
