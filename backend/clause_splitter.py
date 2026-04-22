from nltk.tokenize import sent_tokenize

def extract_clauses(text: str):
    """
    Extract meaningful legal sentences from raw document text.
    """
    sentences = sent_tokenize(text)
    return [s.strip() for s in sentences if len(s.split()) >= 8]
