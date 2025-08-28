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
}
