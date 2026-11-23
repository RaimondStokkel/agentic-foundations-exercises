from .keywords import EMERGENCY_KEYWORDS, URGENT_CATEGORIES


def classify_repair_request(description, category=None, vulnerable_tenant=False):
    """Classify a tenant repair request.

    description: free text written by the tenant.
    category: category picked in the tenant portal (optional).
    vulnerable_tenant: the tenant needs extra care, e.g. elderly or medical.
    Returns "emergency", "urgent" or "normal".
    """
    if not isinstance(description, str) or description.strip() == "":
        raise ValueError("description is required")

    # Tenants who need extra care get a fast response.
    if vulnerable_tenant:
        return "urgent"

    if any(keyword in description for keyword in EMERGENCY_KEYWORDS):
        return "emergency"

    if category in URGENT_CATEGORIES:
        return "urgent"

    return "normal"
