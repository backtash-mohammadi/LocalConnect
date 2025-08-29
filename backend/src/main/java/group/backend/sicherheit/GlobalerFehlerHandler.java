package group.backend.sicherheit;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 🇩🇪 Vereinheitlichte Fehler-Antworten als JSON.
 *     - Immer ein "message"-Feld für den Frontend-Client.
 *     - Hilft, 409/400 sauber anzuzeigen (keine Umleitung auf /error als 401).
 */
@RestControllerAdvice
public class GlobalerFehlerHandler {

    // 🇩🇪 Spezifische Status-Fehler (z.B. 409 CONFLICT bei doppelter E-Mail)
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> behandleResponseStatus(ResponseStatusException ausnahme,
                                                                      HttpServletRequest anfrage) {
        Map<String, Object> koerper = new LinkedHashMap<>();

        int statusCode = ausnahme.getStatusCode().value();
        koerper.put("status", statusCode);

        HttpStatus statusObjekt = HttpStatus.resolve(statusCode);
        String grundPhrase = (statusObjekt != null) ? statusObjekt.getReasonPhrase() : "Unbekannter Status";
        koerper.put("error", grundPhrase);

        String nachricht = ausnahme.getReason();
        if (nachricht == null || nachricht.isBlank()) {
            nachricht = "Unbekannter Fehler";
        }
        koerper.put("message", nachricht);

        koerper.put("path", anfrage.getRequestURI());

        return ResponseEntity.status(statusCode).body(koerper);
    }

    // 🇩🇪 Fallback für alle anderen unbehandelten Fehler (500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> allgemeinerFehler(Exception ausnahme,
                                                                 HttpServletRequest anfrage) {
        Map<String, Object> koerper = new LinkedHashMap<>();

        int statusCode = HttpStatus.INTERNAL_SERVER_ERROR.value();
        koerper.put("status", statusCode);
        koerper.put("error", HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase());

        String nachricht = (ausnahme.getMessage() != null && !ausnahme.getMessage().isBlank())
                ? ausnahme.getMessage()
                : "Unbekannter Fehler";
        koerper.put("message", nachricht);

        koerper.put("path", anfrage.getRequestURI());

        return ResponseEntity.status(statusCode).body(koerper);
    }
}
