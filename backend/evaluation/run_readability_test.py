from extract_pdf_text import extract_text_from_pdf
from readability_evaluator import structured_summary_to_text, calculate_readability
from sample_data import samples

print("\nREADABILITY EVALUATION RESULTS\n")

for idx, sample in enumerate(samples, 1):
    original_text = extract_text_from_pdf(sample["pdf_path"])
    summary_text = structured_summary_to_text(sample["summary"])

    original_scores = calculate_readability(original_text)
    summary_scores = calculate_readability(summary_text)

    print(f"Document {idx}")
    print("Original Flesch Reading Ease:", round(original_scores["flesch_reading_ease"], 2))
    print("Summary Flesch Reading Ease:", round(summary_scores["flesch_reading_ease"], 2))
    print("Original Grade Level:", round(original_scores["flesch_kincaid_grade"], 2))
    print("Summary Grade Level:", round(summary_scores["flesch_kincaid_grade"], 2))
    print("-" * 40)
