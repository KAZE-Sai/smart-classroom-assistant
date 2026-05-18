import re

PATTERNS = {
    "quiz": [
        r"\bquiz\b", r"\btest\b", r"\bquestions?\b", r"\bpractice\b", r"\bmcq\b"
    ],
    "summarize": [
        r"\bsummar\w+\b", r"\bsummarise\b", r"\bnotes?\b", r"\bshorten\b", r"\bbrief\b", r"\bparagraph\b"
    ],
    "study_plan": [
        r"\bstudy plan\b", r"\bexam in\b", r"\bschedule\b", r"\bdays? left\b", r"\bprepare\b", r"\bplan\b"
    ],
    "missed_lecture": [
        r"\bmissed\b", r"\bskipped\b", r"\babsent\b", r"\bdidn.t attend\b", r"\bcouldn.t come\b"
    ],
    "doubt": [
        r"\bexplain\b", r"\bwhat is\b", r"\bhow does\b", r"\bwhy is\b", r"\bdefine\b",
        r"\bwhat are\b", r"\bhow to\b", r"\bdifference between\b", r"\bmeaning of\b"
    ],
}

def classify(text: str) -> str:
    text_lower = text.lower()
    scores = {task: 0 for task in PATTERNS}

    for task, patterns in PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text_lower):
                scores[task] += 1

    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "doubt"
