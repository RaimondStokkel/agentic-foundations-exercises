final class Keywords {

    // Keywords that make a repair request an emergency (respond within 4 hours).
    // Tenants write in Dutch or English. Keywords are lower case and matched as whole words.
    static final String[] EMERGENCY = {
        // English
        "gas smell",
        "gas leak",
        "fire",
        "flooding",
        "no heating",
        // Dutch
        "gaslucht",
        "gasgeur",
        "gaslek",
        "ruik gas",
        "brand",
        "overstroming",
        "wateroverlast",
        "geen verwarming",
    };

    // Categories that are urgent (respond within 24 hours) when there is no emergency.
    static final String[] URGENT_CATEGORIES = { "heating", "electricity", "lock" };

    private Keywords() {
    }
}
