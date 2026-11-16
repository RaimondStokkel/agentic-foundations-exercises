import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public final class Triage {

    public enum Priority { EMERGENCY, URGENT, NORMAL }

    private static final List<Pattern> EMERGENCY_PATTERNS =
        Arrays.stream(Keywords.EMERGENCY).map(Triage::wholeWord).collect(Collectors.toList());
    private static final List<Pattern> URGENT_PATTERNS =
        Arrays.stream(Keywords.URGENT).map(Triage::wholeWord).collect(Collectors.toList());

    private Triage() {
    }

    // Whole words only: "brand" matches "brand in de meterkast", not "brandweer".
    private static Pattern wholeWord(String keyword) {
        return Pattern.compile("(?<!\\w)" + Pattern.quote(keyword) + "(?!\\w)", Pattern.UNICODE_CHARACTER_CLASS);
    }

    private static String normalise(String text) {
        return text.toLowerCase(Locale.ROOT).trim().replaceAll("\\s+", " ");
    }

    private static boolean matchesAny(List<Pattern> patterns, String text) {
        return patterns.stream().anyMatch(pattern -> pattern.matcher(text).find());
    }

    /**
     * Classify a tenant repair request.
     *
     * @param description      free text written by the tenant
     * @param category         category picked in the tenant portal (may be null)
     * @param vulnerableTenant tenant needs extra care (e.g. elderly, medical)
     */
    public static Priority classify(String description, String category, boolean vulnerableTenant) {
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException("description is required");
        }
        if (description.length() > Keywords.MAX_DESCRIPTION_LENGTH) {
            throw new IllegalArgumentException("description is longer than " + Keywords.MAX_DESCRIPTION_LENGTH + " characters");
        }

        String text = normalise(description);
        if (matchesAny(EMERGENCY_PATTERNS, text)) {
            return Priority.EMERGENCY;
        }

        boolean urgentCategory = category != null && Arrays.asList(Keywords.URGENT_CATEGORIES).contains(normalise(category));
        if (urgentCategory || matchesAny(URGENT_PATTERNS, text) || vulnerableTenant) {
            return Priority.URGENT;
        }

        return Priority.NORMAL;
    }
}
