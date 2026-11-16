using RepairTriage;
using Xunit;

namespace RepairTriage.Tests;

public class TriageTests
{
    [Fact(DisplayName = "gas smell in English is an emergency")]
    public void GasSmellInEnglishIsAnEmergency() =>
        Assert.Equal(Priority.Emergency, Triage.Classify("There is a gas smell in the hallway", "other"));

    [Fact(DisplayName = "gas smell is an emergency, also when the tenant writes Dutch")]
    public void GasSmellIsAnEmergencyAlsoInDutch() =>
        Assert.Equal(Priority.Emergency, Triage.Classify("Gaslucht in de keuken", "heating"));

    [Fact(DisplayName = "heating problem without emergency keywords is urgent")]
    public void HeatingProblemIsUrgent() =>
        Assert.Equal(Priority.Urgent, Triage.Classify("Radiator in bedroom stays cold", "heating"));

    [Fact(DisplayName = "vulnerable tenant makes a normal request urgent")]
    public void VulnerableTenantMakesRequestUrgent() =>
        Assert.Equal(Priority.Urgent, Triage.Classify("Leaking tap", "plumbing", vulnerableTenant: true));

    [Fact(DisplayName = "leaking tap is normal")]
    public void LeakingTapIsNormal() =>
        Assert.Equal(Priority.Normal, Triage.Classify("Leaking tap in the bathroom", "plumbing"));

    [Fact(DisplayName = "empty description is rejected")]
    public void EmptyDescriptionIsRejected() =>
        Assert.Throws<ArgumentException>(() => Triage.Classify("   "));

    [Fact(DisplayName = "matching ignores case and extra spaces")]
    public void MatchingIgnoresCaseAndSpaces() =>
        Assert.Equal(Priority.Emergency, Triage.Classify("GAS   SMELL near the meter", "other"));

    [Fact(DisplayName = "keywords inside longer words are not emergencies")]
    public void KeywordsInsideLongerWordsAreNotEmergencies()
    {
        Assert.Equal(Priority.Urgent, Triage.Classify("Brandweer heeft de deur geforceerd", "lock"));
        Assert.Equal(Priority.Normal, Triage.Classify("Fireplace door is loose", "other"));
    }

    // Backlog for part 5. Remove the Skip = "..." part to switch a test on.

    [Fact(DisplayName = "category ignores case and extra spaces", Skip = "Backlog: switch on in part 5")]
    public void CategoryIgnoresCaseAndSpaces() =>
        Assert.Equal(Priority.Urgent, Triage.Classify("Radiator stays cold", " Heating "));

    [Fact(DisplayName = "no hot water is urgent, also in Dutch", Skip = "Backlog: switch on in part 5")]
    public void NoHotWaterIsUrgent()
    {
        Assert.Equal(Priority.Urgent, Triage.Classify("No hot water in the shower", "other"));
        Assert.Equal(Priority.Urgent, Triage.Classify("Geen warm water sinds gisteren", "other"));
    }

    [Fact(DisplayName = "descriptions longer than 2000 characters are rejected", Skip = "Backlog: switch on in part 5")]
    public void LongDescriptionsAreRejected()
    {
        Assert.Equal(Priority.Normal, Triage.Classify(new string('x', 2000)));
        Assert.Throws<ArgumentException>(() => Triage.Classify(new string('x', 2001)));
    }
}
