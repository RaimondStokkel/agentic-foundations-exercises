import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// Run with: java RunTests.java   (no Maven, Gradle or JUnit needed)
public class TriageTest {

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface Test {
        String value(); // the test name
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface Skip {
        String value(); // why the test is switched off
    }

    @Test("gas smell in English is an emergency")
    void gasSmellInEnglish() {
        assertEquals(Triage.Priority.EMERGENCY, Triage.classify("There is a gas smell in the hallway", "other", false));
    }

    @Test("gas smell is an emergency, also when the tenant writes Dutch")
    void gasSmellInDutch() {
        assertEquals(Triage.Priority.EMERGENCY, Triage.classify("Gaslucht in de keuken", "heating", false));
    }

    @Test("heating problem without emergency keywords is urgent")
    void heatingProblemIsUrgent() {
        assertEquals(Triage.Priority.URGENT, Triage.classify("Radiator in bedroom stays cold", "heating", false));
    }

    @Test("vulnerable tenant makes a normal request urgent")
    void vulnerableTenantIsUrgent() {
        assertEquals(Triage.Priority.URGENT, Triage.classify("Leaking tap", "plumbing", true));
    }

    @Test("leaking tap is normal")
    void leakingTapIsNormal() {
        assertEquals(Triage.Priority.NORMAL, Triage.classify("Leaking tap in the bathroom", "plumbing", false));
    }

    @Test("empty description is rejected")
    void emptyDescriptionIsRejected() {
        assertThrows(IllegalArgumentException.class, () -> Triage.classify("   ", null, false));
    }

    // Backlog for block 3. Delete the @Skip line to switch a test on.

    @Skip("Backlog: switch on in block 3")
    @Test("category ignores case and extra spaces")
    void categoryIgnoresCaseAndSpaces() {
        assertEquals(Triage.Priority.URGENT, Triage.classify("Radiator stays cold", " Heating ", false));
    }

    @Skip("Backlog: switch on in block 3")
    @Test("no hot water is urgent, also in Dutch")
    void noHotWaterIsUrgent() {
        assertEquals(Triage.Priority.URGENT, Triage.classify("No hot water in the shower", "other", false));
        assertEquals(Triage.Priority.URGENT, Triage.classify("Geen warm water sinds gisteren", "other", false));
    }

    @Skip("Backlog: switch on in block 3")
    @Test("descriptions longer than 2000 characters are rejected")
    void longDescriptionsAreRejected() {
        assertEquals(Triage.Priority.NORMAL, Triage.classify("x".repeat(2000), null, false));
        assertThrows(IllegalArgumentException.class, () -> Triage.classify("x".repeat(2001), null, false));
    }

    static void assertEquals(Object expected, Object actual) {
        if (!expected.equals(actual)) {
            throw new AssertionError("expected: " + expected + ", actual: " + actual);
        }
    }

    static void assertThrows(Class<? extends Throwable> expected, Runnable call) {
        try {
            call.run();
        } catch (Throwable thrown) {
            if (expected.isInstance(thrown)) {
                return;
            }
            throw new AssertionError("expected " + expected.getSimpleName() + ", got " + thrown);
        }
        throw new AssertionError("expected " + expected.getSimpleName() + ", nothing was thrown");
    }
}
