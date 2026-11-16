final class Keywords {

    // Keywords that make a repair request an emergency (respond within 4 hours).
    // Tenants write in Dutch or English.
    static final String[] EMERGENCY = {
        "gas smell",
        "gas leak",
        "fire",
        "flooding",
        "no heating",
    };

    // Categories that are urgent (respond within 24 hours) when there is no emergency.
    static final String[] URGENT_CATEGORIES = { "heating", "electricity", "lock" };

    private Keywords() {
    }
}
