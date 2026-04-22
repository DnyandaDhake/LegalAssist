from transformers import pipeline
import torch
import re

print("[SUMMARIZATION] Loading BART-Large-CNN summarizer...")

class AdvancedLegalSummarizer:
    """
    Legal document summarizer using BART
    Handles long documents safely
    """

    def __init__(self):
        self.summarizer = pipeline(
            "summarization",
            model="facebook/bart-base",
            device=0 
        )

    # --------------------------------------------------
    # CLEAN PDF NOISE
    # --------------------------------------------------
    def clean_text(self, text: str) -> str:
        text = re.sub(r'Page\s+\d+\s+of\s+\d+', '', text, flags=re.IGNORECASE)
        text = re.sub(r'Registered as Document No\.\d+.*', '', text, flags=re.IGNORECASE)
        text = re.sub(
            r'(For confidential support.*?$)|(call the Samaritans.*?$)|'
            r'(National Suicide Prevention.*?$)',
            '',
            text,
            flags=re.IGNORECASE | re.MULTILINE
        )
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    # --------------------------------------------------
    # SAFE WORD LIMIT (AVOID TOKEN ERROR)
    # --------------------------------------------------
    def safe_truncate(self, text: str, max_words=400):
        words = text.split()
        if len(words) <= max_words:
            return text
        return " ".join(words[:max_words])

    # --------------------------------------------------
    # CHUNK LONG TEXT
    # --------------------------------------------------
    def chunk_text(self, text: str, chunk_size=1800, overlap=200):
        chunks = []
        start = 0
        length = len(text)

        while start < length:
            end = start + chunk_size
            chunks.append(text[start:end])
            start = end - overlap

        return chunks

    # --------------------------------------------------
    # MAIN SUMMARY LOGIC
    # --------------------------------------------------
    def generate_summary(self, text: str, relevant_sentences=None) -> str:
        text = self.clean_text(text)

        # Prefer SBERT sentences if present
        if relevant_sentences:
            joined = " ".join(relevant_sentences)
            joined = self.safe_truncate(joined)

            if len(joined.split()) > 80:
                result = self.summarizer(
                    joined,
                    max_length=200,
                    min_length=120,
                    do_sample=False,
                    num_beams=1
                )
                return self.post_process(result[0]["summary_text"])

        # Otherwise do hierarchical summarization
        chunks = self.chunk_text(text)
        chunk_summaries = []

        for chunk in chunks:
            if len(chunk.split()) < 60:
                continue

            result = self.summarizer(
                chunk,
                max_length=220,
                min_length=180,
                do_sample=False,
                num_beams=1
            )
            chunk_summaries.append(result[0]["summary_text"])

        combined = " ".join(chunk_summaries)
        combined = self.safe_truncate(combined)

        final = self.summarizer(
            combined,
            max_length=200,
            min_length=150,
            do_sample=False,
            num_beams=1
        )[0]["summary_text"]

        return self.post_process(final)

    # --------------------------------------------------
    # SIMPLE ENGLISH POST-PROCESSING
    # --------------------------------------------------
    def post_process(self, summary: str) -> str:
        summary = re.sub(r'\s+', ' ', summary).strip()

        replacements = [
            (r'\blicensor\b', 'owner'),
            (r'\blicensee\b', 'tenant'),
            (r'\blicense fee\b', 'rent'),
            (r'\bleave and license\b', 'rental'),
            (r'\blicensed premises\b', 'property'),
            (r'\bherein\b', ''),
            (r'\bwhereas\b', ''),
            (r'\bsubject to\b', ''),
            (r'\brevocable\b', ''),
        ]

        for pat, rep in replacements:
            summary = re.sub(pat, rep, summary, flags=re.IGNORECASE)

        if not summary.lower().startswith("this"):
            summary = "This document is " + summary

        if not summary.endswith("."):
            summary += "."

        return summary


# --------------------------------------------------
# SINGLE INSTANCE
# --------------------------------------------------
legal_summarizer = AdvancedLegalSummarizer()


# --------------------------------------------------
# EXPORTED FUNCTION (USED BY NLP PIPELINE)
# --------------------------------------------------
def compress_text(text, relevant_sentences=None):
    """
    Compresses legal text using BART summarization
    This function is imported in nlp_pipeline.py
    """
    return legal_summarizer.generate_summary(text, relevant_sentences)
