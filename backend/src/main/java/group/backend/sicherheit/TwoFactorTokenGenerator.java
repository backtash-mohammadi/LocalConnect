package group.backend.sicherheit;

import java.security.SecureRandom;

public final class TwoFactorTokenGenerator {
    private static final SecureRandom RAND = new SecureRandom();

    private static final char[] ALPHANUM =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".toCharArray();

    private TwoFactorTokenGenerator() {}

    /** 6-char mixed-case alphanumeric, e.g. "aB7xQ2" */
    public static String generateCode() {
        return token(6);
    }

    /** Mixed-case alphanumeric token of given length. */
    public static String token(int length) {
        char[] out = new char[length];
        for (int i = 0; i < length; i++) {
            out[i] = ALPHANUM[RAND.nextInt(ALPHANUM.length)];
        }
        return new String(out);
    }
}
