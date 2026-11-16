namespace RepairTriage;

public static class Keywords
{
    // Keywords that make a repair request an emergency (respond within 4 hours).
    // Tenants write in Dutch or English. Keywords are lower case and matched as whole words.
    public static readonly string[] Emergency =
    [
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
    ];

    // Categories that are urgent (respond within 24 hours) when there is no emergency.
    public static readonly string[] UrgentCategories = ["heating", "electricity", "lock"];

    // Words in the description that make a request urgent, whatever the category.
    public static readonly string[] Urgent = ["no hot water", "geen warm water"];

    // Longer descriptions are rejected, like empty ones.
    public const int MaxDescriptionLength = 2000;
}
