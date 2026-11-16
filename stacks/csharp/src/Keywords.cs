namespace RepairTriage;

public static class Keywords
{
    // Keywords that make a repair request an emergency (respond within 4 hours).
    // Tenants write in Dutch or English.
    public static readonly string[] Emergency =
    [
        "gas smell",
        "gas leak",
        "fire",
        "flooding",
        "no heating",
    ];

    // Categories that are urgent (respond within 24 hours) when there is no emergency.
    public static readonly string[] UrgentCategories = ["heating", "electricity", "lock"];
}
