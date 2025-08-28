package group.backend.mail;

public interface MailDienst {
    /**
     * Sende eine einfache Text-E-Mail.
     * @param an Empfänger-Adresse
     * @param betreff Betreff
     * @param text Textinhalt (Plain Text)
     */
    void sende(String an, String betreff, String text);
}
