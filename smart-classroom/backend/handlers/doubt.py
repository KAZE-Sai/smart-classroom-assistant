TOPIC_KNOWLEDGE = {
    "normalization": {
        "explanation": "Normalization is the process of organizing a database to reduce redundancy and improve data integrity.",
        "key_points": [
            "1NF: Eliminate duplicate columns, ensure atomic values",
            "2NF: Remove partial dependencies (applies to composite keys)",
            "3NF: Remove transitive dependencies",
            "BCNF: Stronger version of 3NF",
        ],
        "example": "A table storing student and course info together violates normalization — split it into Students and Courses tables."
    },
    "os": {
        "explanation": "An Operating System (OS) is system software that manages hardware and software resources.",
        "key_points": [
            "Process Management: scheduling, creation, termination",
            "Memory Management: allocation, paging, segmentation",
            "File System: storage, retrieval, permissions",
            "I/O Management: device drivers, buffering",
        ],
        "example": "Windows, Linux, and macOS are popular operating systems."
    },
    "tcp": {
        "explanation": "TCP (Transmission Control Protocol) is a connection-oriented protocol that ensures reliable data delivery.",
        "key_points": [
            "Three-way handshake: SYN, SYN-ACK, ACK",
            "Guarantees delivery and order of packets",
            "Used in HTTP, FTP, email",
            "Slower than UDP due to error checking",
        ],
        "example": "When you load a webpage, TCP ensures all data packets arrive correctly."
    },
    "oop": {
        "explanation": "Object-Oriented Programming (OOP) is a paradigm based on objects that contain data and behavior.",
        "key_points": [
            "Encapsulation: bundling data and methods",
            "Inheritance: child class inherits from parent",
            "Polymorphism: same interface, different behavior",
            "Abstraction: hiding implementation details",
        ],
        "example": "A 'Car' class can have attributes (color, speed) and methods (drive, brake)."
    },
    "default": {
        "explanation": "This is a broad topic in computer science. Here's a general breakdown to help you understand it.",
        "key_points": [
            "Break the topic into smaller sub-concepts",
            "Understand the 'why' before the 'how'",
            "Look for real-world analogies",
            "Practice with examples",
        ],
        "example": "Try relating the concept to something you already know."
    }
}

def get_topic_key(text: str) -> str:
    text_lower = text.lower()
    for key in TOPIC_KNOWLEDGE:
        if key in text_lower:
            return key
    return "default"

def handle(user_input: str) -> dict:
    key = get_topic_key(user_input)
    data = TOPIC_KNOWLEDGE[key]
    return {
        "task": "Doubt Solving",
        "topic": key.upper() if key != "default" else "General Concept",
        "explanation": data["explanation"],
        "key_points": data["key_points"],
        "example": data["example"]
    }
