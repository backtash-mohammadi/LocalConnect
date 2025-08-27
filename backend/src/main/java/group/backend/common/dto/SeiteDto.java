package group.backend.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Einfache generische Seiten-Antwort für Pagination. */
@Data @AllArgsConstructor @NoArgsConstructor
public class SeiteDto<T> {
    private List<T> inhalte;     // aktuelle Inhalte
    private int seite;           // aktuelle Seite (0-basiert)
    private int groesse;         // Seitengröße
    private long gesamtElemente; // Anzahl aller Elemente
    private int gesamtSeiten;    // Anzahl aller Seiten
}
