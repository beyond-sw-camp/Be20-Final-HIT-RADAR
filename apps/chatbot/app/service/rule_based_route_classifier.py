from enum import Enum


class Route(Enum):
    DOCUMENT = "DOCUMENT"
    PERSONAL = "PERSONAL"
    SMALL_TALK = "SMALL_TALK"


class RuleBasedRouteClassifier:
    def __init__(self):
        self.rules = {
            Route.DOCUMENT: ["규정", "정책", "절차", "휴가", "복리후생"],
            Route.PERSONAL: ["개인정보", "급여", "연차", "동료", "팀"],
        }

    def classify(self, text: str) -> Route:
        # User-defined priority rule: If text starts with "[규정]", route to DOCUMENT
        if text.startswith("[규정]"):
            return Route.DOCUMENT

        for route, keywords in self.rules.items():
            if any(keyword in text for keyword in keywords):
                return route
        return Route.SMALL_TALK
