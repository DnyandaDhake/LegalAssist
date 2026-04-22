from extract_pdf_text import extract_text_from_pdf
from consistency_checker import check_consistency
from sample_data import samples

print("\nDOCUMENT-LEVEL CONSISTENCY CHECK\n")

for idx, sample in enumerate(samples, 1):
    print(f"Document {idx}")

    document_text = extract_text_from_pdf(sample["pdf_path"])

    # Convert summary dict to text
    summary_text = " ".join(
        f"{k} {v}".lower() for k, v in sample["summary"].items()
    )

    result = check_consistency(document_text.lower(), summary_text)

    print("Dates in document:", result["doc_dates"])
    print("Dates in summary:", result["summary_dates"])
    print("Amounts in document:", result["doc_amounts"])
    print("Amounts in summary:", result["summary_amounts"])

    print("Date consistency:", result["date_consistent"])
    print("Amount consistency:", result["amount_consistent"])
    print(f"Consistency Score: {result['consistency_score']:.2f}%")
    print("-" * 45)
