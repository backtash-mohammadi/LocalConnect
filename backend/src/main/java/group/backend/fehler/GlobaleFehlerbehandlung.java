package group.backend.fehler;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;


import java.util.HashMap;
import java.util.Map;


@ControllerAdvice
public class GlobaleFehlerbehandlung {


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> validierungsFehler(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("fehler", "VALIDIERUNG");
        Map<String, String> felder = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            felder.put(fe.getField(), fe.getDefaultMessage());
        }
        body.put("felder", felder);
        return ResponseEntity.badRequest().body(body);
    }


    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> illegalArgument(IllegalArgumentException ex) {
        Map<String, Object> body = Map.of(
                "fehler", "REQUEST",
                "nachricht", ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }


    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<?> badCredentials(org.springframework.security.authentication.BadCredentialsException ex) {
        Map<String, Object> body = Map.of(
                "fehler", "LOGIN",
                "nachricht", "E-Mail oder Passwort ist falsch"
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }
}
