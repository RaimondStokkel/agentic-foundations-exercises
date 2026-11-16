import unittest

from src.triage import classify_repair_request


class TriageTest(unittest.TestCase):
    def test_gas_smell_in_english_is_an_emergency(self):
        self.assertEqual(
            classify_repair_request("There is a gas smell in the hallway", category="other"),
            "emergency",
        )

    def test_gas_smell_is_an_emergency_also_when_the_tenant_writes_dutch(self):
        self.assertEqual(
            classify_repair_request("Gaslucht in de keuken", category="heating"),
            "emergency",
        )

    def test_heating_problem_without_emergency_keywords_is_urgent(self):
        self.assertEqual(
            classify_repair_request("Radiator in bedroom stays cold", category="heating"),
            "urgent",
        )

    def test_vulnerable_tenant_makes_a_normal_request_urgent(self):
        self.assertEqual(
            classify_repair_request("Leaking tap", category="plumbing", vulnerable_tenant=True),
            "urgent",
        )

    def test_leaking_tap_is_normal(self):
        self.assertEqual(
            classify_repair_request("Leaking tap in the bathroom", category="plumbing"),
            "normal",
        )

    def test_empty_description_is_rejected(self):
        with self.assertRaises(ValueError):
            classify_repair_request("   ")

    def test_matching_ignores_case_and_extra_spaces(self):
        self.assertEqual(
            classify_repair_request("GAS   SMELL near the meter", category="other"),
            "emergency",
        )

    def test_keywords_inside_longer_words_are_not_emergencies(self):
        self.assertEqual(
            classify_repair_request("Brandweer heeft de deur geforceerd", category="lock"),
            "urgent",
        )
        self.assertEqual(
            classify_repair_request("Fireplace door is loose", category="other"),
            "normal",
        )

    # Backlog for part 5. Delete the @unittest.skip line to switch a test on.

    @unittest.skip("Backlog: switch on in part 5")
    def test_category_ignores_case_and_extra_spaces(self):
        self.assertEqual(
            classify_repair_request("Radiator stays cold", category=" Heating "),
            "urgent",
        )

    @unittest.skip("Backlog: switch on in part 5")
    def test_no_hot_water_is_urgent_also_in_dutch(self):
        self.assertEqual(
            classify_repair_request("No hot water in the shower", category="other"),
            "urgent",
        )
        self.assertEqual(
            classify_repair_request("Geen warm water sinds gisteren", category="other"),
            "urgent",
        )

    @unittest.skip("Backlog: switch on in part 5")
    def test_descriptions_longer_than_2000_characters_are_rejected(self):
        self.assertEqual(classify_repair_request("x" * 2000), "normal")
        with self.assertRaises(ValueError):
            classify_repair_request("x" * 2001)


if __name__ == "__main__":
    unittest.main()
