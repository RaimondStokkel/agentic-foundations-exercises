import java.util.Arrays;

public final class Triage {

    public enum Priority { EMERGENCY, URGENT, NORMAL }

    private Triage() {
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

        // Tenants who need extra care get a fast response.
        if (vulnerableTenant) {
            return Priority.URGENT;
        }

        for (String keyword : Keywords.EMERGENCY) {
            if (description.contains(keyword)) {
                return Priority.EMERGENCY;
            }
        }

        if (category != null && Arrays.asList(Keywords.URGENT_CATEGORIES).contains(category)) {
            return Priority.URGENT;
        }

        return Priority.NORMAL;
    }
}
