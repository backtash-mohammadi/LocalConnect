package group.backend.anfrage;

/**
 * Status einer Anfrage, wie in der Datenbank gespeichert.
 */
public enum AnfrageStatus {
    OPEN("open"),
    IN_PROGRESS("in_progress"),
    COMPLETED("completed"),
    CANCELLED("cancelled");


    private final String dbValue;


    AnfrageStatus(String dbValue){ this.dbValue = dbValue; }
    public String getDbValue(){ return dbValue; }
}
