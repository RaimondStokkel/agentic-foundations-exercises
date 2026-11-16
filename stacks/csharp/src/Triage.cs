using System.Text.RegularExpressions;

namespace RepairTriage;

public enum Priority
{
    Emergency,
    Urgent,
    Normal,
}

public static class Triage
{
    // Whole words only: "brand" matches "brand in de meterkast", not "brandweer".
    private static Regex WholeWord(string keyword) => new($@"(?<!\w){Regex.Escape(keyword)}(?!\w)");

    private static readonly Regex[] EmergencyPatterns = Keywords.Emergency.Select(WholeWord).ToArray();
    private static readonly Regex[] UrgentPatterns = Keywords.Urgent.Select(WholeWord).ToArray();

    private static string Normalise(string text) => Regex.Replace(text.ToLowerInvariant(), @"\s+", " ").Trim();

    /// <summary>Classify a tenant repair request.</summary>
    /// <param name="description">Free text written by the tenant.</param>
    /// <param name="category">Category picked in the tenant portal.</param>
    /// <param name="vulnerableTenant">Tenant needs extra care (e.g. elderly, medical).</param>
    public static Priority Classify(string description, string? category = null, bool vulnerableTenant = false)
    {
        if (string.IsNullOrWhiteSpace(description))
        {
            throw new ArgumentException("description is required", nameof(description));
        }

        if (description.Length > Keywords.MaxDescriptionLength)
        {
            throw new ArgumentException($"description is longer than {Keywords.MaxDescriptionLength} characters", nameof(description));
        }

        var text = Normalise(description);
        if (EmergencyPatterns.Any(pattern => pattern.IsMatch(text)))
        {
            return Priority.Emergency;
        }

        var urgentCategory = category is not null && Keywords.UrgentCategories.Contains(Normalise(category));
        if (urgentCategory || UrgentPatterns.Any(pattern => pattern.IsMatch(text)) || vulnerableTenant)
        {
            return Priority.Urgent;
        }

        return Priority.Normal;
    }
}
