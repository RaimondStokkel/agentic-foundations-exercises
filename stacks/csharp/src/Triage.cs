namespace RepairTriage;

public enum Priority
{
    Emergency,
    Urgent,
    Normal,
}

public static class Triage
{
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

        if (Keywords.Emergency.Any(keyword => description.Contains(keyword)))
        {
            return Priority.Emergency;
        }

        if ((category is not null && Keywords.UrgentCategories.Contains(category)) || vulnerableTenant)
        {
            return Priority.Urgent;
        }

        return Priority.Normal;
    }
}
