import textstat

def structured_summary_to_text(summary_dict):
    """
    Converts key-value summary into readable sentences
    """
    sentences = []
    for key, value in summary_dict.items():
        sentences.append(f"{key} is {value}.")
    return " ".join(sentences)

def calculate_readability(text):
    return {
        "flesch_reading_ease": textstat.flesch_reading_ease(text),
        "flesch_kincaid_grade": textstat.flesch_kincaid_grade(text)
    }
