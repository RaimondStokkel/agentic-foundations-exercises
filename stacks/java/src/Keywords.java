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

    // Words in the description that make a request urgent, whatever the category.
    static final String[] URGENT = { "no hot water", "geen warm water" };

    // Longer descriptions are rejected, like empty ones.
    static final int MAX_DESCRIPTION_LENGTH = 2000;

    private Keywords() {
    }
}
