import re

SUBJECT_TOPICS = {
    "os": ["Processes & Threads", "CPU Scheduling", "Memory Management", "Deadlocks", "File Systems"],
    "dbms": ["ER Model", "Normalization", "SQL Queries", "Transactions & ACID", "Indexing"],
    "cn": ["OSI & TCP/IP Model", "IP Addressing", "Routing Protocols", "TCP vs UDP", "Application Layer Protocols"],
    "dsa": ["Arrays & Strings", "Linked Lists", "Trees & Graphs", "Sorting Algorithms", "Dynamic Programming"],
    "default": ["Core Concepts", "Important Definitions", "Formulas & Theorems", "Previous Year Questions", "Mock Tests"]
}

def extract_days(text: str) -> int:
    match = re.search(r'(\d+)\s*day', text.lower())
    if match:
        return int(match.group(1))
    if "week" in text.lower():
        return 7
    return 3  # default

def extract_subjects(text: str) -> list:
    found = []
    text_lower = text.lower()
    for subj in SUBJECT_TOPICS:
        if subj in text_lower:
            found.append(subj)
    return found if found else ["default"]

def handle(user_input: str) -> dict:
    days = extract_days(user_input)
    subjects = extract_subjects(user_input)

    plan = []
    day = 1

    for subj in subjects:
        topics = SUBJECT_TOPICS.get(subj, SUBJECT_TOPICS["default"])
        topics_per_day = max(1, len(topics) // max(1, days // len(subjects)))

        for i in range(0, len(topics), topics_per_day):
            if day > days:
                break
            chunk = topics[i:i + topics_per_day]
            plan.append({
                "day": day,
                "subject": subj.upper(),
                "topics": chunk,
                "task": f"Study + make short notes"
            })
            day += 1

    # Fill remaining days with revision
    while day <= days:
        plan.append({
            "day": day,
            "subject": "REVISION",
            "topics": ["Review all notes", "Solve past papers", "Mock test"],
            "task": "Revision & Practice"
        })
        day += 1

    return {
        "task": "Study Planning",
        "total_days": days,
        "subjects": [s.upper() for s in subjects],
        "plan": plan,
        "tip": "Spend 25-min focused sessions (Pomodoro). Take 5-min breaks. Revise before sleeping."
    }
