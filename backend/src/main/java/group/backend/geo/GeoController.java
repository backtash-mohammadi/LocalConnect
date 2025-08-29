package group.backend.geo;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/geocode")
public class GeoController {

    private final WebClient webClient;

    public GeoController(WebClient.Builder builder) {
        this.webClient = builder
                .baseUrl("https://nominatim.openstreetmap.org")
                // 👇 Укажи реальный контакт (почта или URL проекта)
                .defaultHeader(HttpHeaders.USER_AGENT, "LocalConnect/1.0 (contact: you@example.com)")
                .defaultHeader(HttpHeaders.ACCEPT, "application/json")
                .build();
    }

    @GetMapping("/search")
    public Mono<ResponseEntity<String>> search(
            @RequestParam("q") String q,
            @RequestParam(value = "limit", defaultValue = "5") int limit
    ) {
        if (q == null || q.trim().length() < 3) {
            return Mono.just(ResponseEntity.badRequest().body("[]"));
        }

        return webClient.get()
                .uri(uri -> uri.path("/search")
                        .queryParam("format", "json")
                        .queryParam("addressdetails", "1")
                        .queryParam("limit", limit)
                        .queryParam("q", q)
                        .build())
                // Мягкая обработка 403/429 от Nominatim → не роняем UI
                .exchangeToMono(resp -> {
                    int code = resp.statusCode().value();
                    if (code == 403 || code == 429) {
                        return Mono.just(ResponseEntity.ok("[]"));
                    }
                    return resp.toEntity(String.class);
                });
    }

    // 29,8 added the get endpoint below for the map...
    // NEU: Reverse-Geocoding: Koordinaten -> Adressbestandteile (z. B. Stadt)
    @GetMapping("/reverse")
    public Mono<ResponseEntity<String>> reverse(
            @RequestParam("lat") double lat,
            @RequestParam("lon") double lon,
            @RequestParam(value = "zoom", defaultValue = "10") int zoom,
            @RequestParam(value = "addressdetails", defaultValue = "1") int addressDetails
    ) {
        // Einfache Plausibilitätsprüfung
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            return Mono.just(ResponseEntity.badRequest().body("{\"error\":\"Ungültige Koordinaten\"}"));
        }

        return webClient.get()
                .uri(uri -> uri.path("/reverse")
                        .queryParam("format", "jsonv2")
                        .queryParam("lat", lat)
                        .queryParam("lon", lon)
                        .queryParam("zoom", zoom)
                        .queryParam("addressdetails", addressDetails)
                        .build())
                // Wie oben: 403/429 freundlich behandeln
                .exchangeToMono(resp -> {
                    int code = resp.statusCode().value();
                    if (code == 403 || code == 429) {
                        // Liefere minimal valides JSON zurück, damit der Client nicht crasht
                        return Mono.just(ResponseEntity.ok("{\"address\":{}}"));
                    }
                    return resp.toEntity(String.class);
                });
    }


}
