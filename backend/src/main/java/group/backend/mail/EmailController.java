package group.backend.mail;

import group.backend.sicherheit.TwoFactorTokenGenerator;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
@RequestMapping("/api/mail")
@CrossOrigin(origins = "http://localhost:5173")
public class EmailController {

    @PostMapping("/test")
    public Map<String, Object> send(@RequestBody Map<String, String> body,
                                    jakarta.servlet.http.HttpServletRequest req) throws Exception {
        System.out.println("[BE] HIT /api/mail/test");
        System.out.println("[BE] from: " + req.getRemoteAddr());
        System.out.println("[BE] headers: Content-Type=" + req.getContentType());
        //System.out.println("[BE] body map: " + body);

        String receiver = body.get("email");
        System.out.println("[BE] receiver=" + receiver);

        String code = TwoFactorTokenGenerator.generateCode();

        new Email().sendEmail(receiver, "LocalConnect", "hello this is your 2FA Code:  ",code);
        return Map.of("ok", true);
    }
}
