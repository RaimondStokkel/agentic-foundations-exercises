import re

from .keywords import EMERGENCY_KEYWORDS, MAX_DESCRIPTION_LENGTH, URGENT_CATEGORIES, URGENT_KEYWORDS


def _whole_word(keyword):
    # Whole words only: "brand" matches "brand in de meterkast", not "brandweer".
    return re.compile(r"(?<!\w)" + re.escape(keyword) + r"(?!\w)")


_EMERGENCY_PATTERNS = [_whole_word(keyword) for keyword in EMERGENCY_KEYWORDS]
_URGENT_PATTERNS = [_whole_word(keyword) for keyword in URGENT_KEYWORDS]


def _normalise(text):
    return " ".join(text.lower().split())


def classify_repair_request(description, category=None, vulnerable_tenant=False):
    """Classify a tenant repair request.

    description: free text written by the tenant.
    category: category picked in the tenant portal (optional).
    vulnerable_tenant: the tenant needs extra care, e.g. elderly or medical.
    Returns "emergency", "urgent" or "normal".
    """
    if not isinstance(description, str) or description.strip() == "":
        raise ValueError("description is required")
    if len(description) > MAX_DESCRIPTION_LENGTH:
        raise ValueError(f"description is longer than {MAX_DESCRIPTION_LENGTH} characters")

    text = _normalise(description)
    if any(pattern.search(text) for pattern in _EMERGENCY_PATTERNS):
        return "emergency"

    urgent_category = isinstance(category, str) and _normalise(category) in URGENT_CATEGORIES
    if urgent_category or any(pattern.search(text) for pattern in _URGENT_PATTERNS) or vulnerable_tenant:
        return "urgent"

    return "normal"
