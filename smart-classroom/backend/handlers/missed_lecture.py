LECTURE_CONTENT = {
    "cn": {
        "topic": "Computer Networks - OSI Model & TCP/IP",
        "explanation": "The OSI model is a 7-layer framework for network communication. Each layer has a specific role.",
        "key_concepts": [
            "Layer 7 - Application: HTTP, FTP, DNS",
            "Layer 6 - Presentation: Encryption, Compression",
            "Layer 5 - Session: Session management",
            "Layer 4 - Transport: TCP/UDP, port numbers",
            "Layer 3 - Network: IP addressing, routing",
            "Layer 2 - Data Link: MAC address, framing",
            "Layer 1 - Physical: Cables, signals",
        ],
        "exam_questions": [
            "What are the 7 layers of the OSI model?",
            "Difference between TCP and UDP?",
            "What is the role of the Network layer?",
            "What does DNS do?"
        ]
    },
    "os": {
        "topic": "Operating Systems - CPU Scheduling",
        "explanation": "CPU scheduling determines which process runs next. Different algorithms optimize for different goals.",
        "key_concepts": [
            "FCFS: First Come First Served — simple but can cause convoy effect",
            "SJF: Shortest Job First — optimal average waiting time",
            "Round Robin: Time quantum based — fair for all processes",
            "Priority Scheduling: Higher priority runs first",
            "Preemptive vs Non-preemptive scheduling",
        ],
        "exam_questions": [
            "What is the convoy effect in FCFS?",
            "Why is SJF optimal?",
            "What is a time quantum in Round Robin?",
            "Difference between preemptive and non-preemptive scheduling?"
        ]
    },
    "dbms": {
        "topic": "DBMS - Transactions and ACID Properties",
        "explanation": "A transaction is a unit of work in a database. ACID properties ensure data reliability.",
        "key_concepts": [
            "Atomicity: All or nothing — transaction fully completes or fully rolls back",
            "Consistency: Database stays in valid state before and after",
            "Isolation: Concurrent transactions don't interfere",
            "Durability: Committed data persists even after crashes",
            "Commit and Rollback operations",
        ],
        "exam_questions": [
            "What are ACID properties?",
            "What is a rollback?",
            "How does isolation prevent dirty reads?",
            "Difference between commit and rollback?"
        ]
    },
    "default": {
        "topic": "General Computer Science Concepts",
        "explanation": "Here's a summary of core CS concepts that are commonly covered in lectures.",
        "key_concepts": [
            "Data Structures: Arrays, Linked Lists, Trees, Graphs",
            "Algorithms: Sorting, Searching, Dynamic Programming",
            "OOP: Encapsulation, Inheritance, Polymorphism, Abstraction",
            "Networking: OSI Model, TCP/IP, HTTP",
            "Database: SQL, Normalization, Transactions",
        ],
        "exam_questions": [
            "What is time complexity?",
            "Explain OOP principles.",
            "What is normalization?",
            "Difference between stack and queue?"
        ]
    }
}

def get_subject_key(text: str) -> str:
    text_lower = text.lower()
    if any(k in text_lower for k in ["cn","network","networking"]):
        return "cn"
    if any(k in text_lower for k in ["os","operating system"]):
        return "os"
    if any(k in text_lower for k in ["dbms","database","sql"]):
        return "dbms"
    return "default"

def handle(user_input: str) -> dict:
    key = get_subject_key(user_input)
    data = LECTURE_CONTENT[key]
    return {
        "task": "Missed Lecture Recovery",
        "topic": data["topic"],
        "explanation": data["explanation"],
        "key_concepts": data["key_concepts"],
        "possible_exam_questions": data["exam_questions"],
        "advice": "Review these concepts and cross-check with your classmates' notes for anything specific your professor covered."
    }
