QUIZ_BANK = {
    "os": [
        {"q": "What is a process in OS?", "options": ["A program in execution","A file on disk","A hardware component","None"], "answer": "A program in execution"},
        {"q": "Which scheduling algorithm gives minimum average waiting time?", "options": ["FCFS","SJF","Round Robin","Priority"], "answer": "SJF"},
        {"q": "What is a deadlock?", "options": ["A fast process","A situation where processes wait forever","A memory error","A CPU burst"], "answer": "A situation where processes wait forever"},
        {"q": "Paging is used for?", "options": ["CPU scheduling","Memory management","File handling","I/O management"], "answer": "Memory management"},
        {"q": "Which is NOT a condition for deadlock?", "options": ["Mutual Exclusion","Hold and Wait","Preemption","Circular Wait"], "answer": "Preemption"},
    ],
    "dbms": [
        {"q": "What does ACID stand for?", "options": ["Atomicity, Consistency, Isolation, Durability","All Correct In Database","Atomic Consistent Integrated Data","None"], "answer": "Atomicity, Consistency, Isolation, Durability"},
        {"q": "Which normal form removes transitive dependency?", "options": ["1NF","2NF","3NF","BCNF"], "answer": "3NF"},
        {"q": "A primary key can be?", "options": ["NULL","Duplicate","Unique and Not Null","Optional"], "answer": "Unique and Not Null"},
        {"q": "SQL stands for?", "options": ["Structured Query Language","Simple Query Language","Standard Query Logic","None"], "answer": "Structured Query Language"},
        {"q": "Which command removes a table permanently?", "options": ["DELETE","TRUNCATE","DROP","REMOVE"], "answer": "DROP"},
    ],
    "cn": [
        {"q": "OSI model has how many layers?", "options": ["4","5","7","6"], "answer": "7"},
        {"q": "Which layer handles routing?", "options": ["Transport","Network","Data Link","Physical"], "answer": "Network"},
        {"q": "TCP is?", "options": ["Connectionless","Connection-oriented","Unreliable","None"], "answer": "Connection-oriented"},
        {"q": "DNS converts?", "options": ["IP to MAC","Domain name to IP","IP to domain","MAC to IP"], "answer": "Domain name to IP"},
        {"q": "HTTP uses which port?", "options": ["21","22","80","443"], "answer": "80"},
    ],
    "default": [
        {"q": "What is an algorithm?", "options": ["A step-by-step procedure","A programming language","A data structure","A hardware component"], "answer": "A step-by-step procedure"},
        {"q": "What does CPU stand for?", "options": ["Central Processing Unit","Computer Personal Unit","Core Processing Utility","None"], "answer": "Central Processing Unit"},
        {"q": "Which data structure uses LIFO?", "options": ["Queue","Stack","Array","Tree"], "answer": "Stack"},
        {"q": "Binary search requires the array to be?", "options": ["Sorted","Unsorted","Empty","Random"], "answer": "Sorted"},
        {"q": "What is the time complexity of binary search?", "options": ["O(n)","O(n²)","O(log n)","O(1)"], "answer": "O(log n)"},
    ]
}

def get_subject_key(text: str) -> str:
    text_lower = text.lower()
    if any(k in text_lower for k in ["os","operating system"]):
        return "os"
    if any(k in text_lower for k in ["dbms","database","sql","normalization"]):
        return "dbms"
    if any(k in text_lower for k in ["cn","network","tcp","ip","osi"]):
        return "cn"
    return "default"

def handle(user_input: str) -> dict:
    key = get_subject_key(user_input)
    questions = QUIZ_BANK[key]
    return {
        "task": "Quiz Generation",
        "subject": key.upper(),
        "total": len(questions),
        "questions": [
            {
                "number": i + 1,
                "question": q["q"],
                "options": q["options"],
                "answer": q["answer"]
            }
            for i, q in enumerate(questions)
        ]
    }
