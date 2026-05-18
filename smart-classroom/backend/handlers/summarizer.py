import re
from collections import Counter

def extract_sentences(text: str):
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if len(s.strip()) > 20]

def score_sentences(sentences: list) -> list:
    word_freq = Counter()
    for s in sentences:
        words = re.findall(r'\b\w+\b', s.lower())
        word_freq.update(words)

    stopwords = {"the","is","in","at","of","a","an","and","to","for","on","it","this","that","was","are","be","with","as","by","from","or","but"}
    for sw in stopwords:
        word_freq.pop(sw, None)

    scored = []
    for s in sentences:
        words = re.findall(r'\b\w+\b', s.lower())
        score = sum(word_freq.get(w, 0) for w in words if w not in stopwords)
        scored.append((score, s))

    scored.sort(reverse=True)
    return scored

def handle(user_input: str) -> dict:
    # Strip instruction prefix if present
    clean = re.sub(r'^(summarize|summarise|give me a summary of|notes?:?)\s*', '', user_input, flags=re.IGNORECASE).strip()

    if len(clean) < 50:
        return {
            "task": "Summarization",
            "error": "Please provide more text to summarize (at least a paragraph)."
        }

    sentences = extract_sentences(clean)
    if not sentences:
        return {"task": "Summarization", "error": "Could not parse sentences from input."}

    scored = score_sentences(sentences)
    top_n = max(3, len(sentences) // 3)
    summary_sentences = [s for _, s in scored[:top_n]]

    # Preserve original order
    ordered = [s for s in sentences if s in summary_sentences]

    return {
        "task": "Summarization",
        "summary": " ".join(ordered),
        "key_points": ordered,
        "exam_tip": "Focus on the highlighted points — they are most likely to appear in exams."
    }
