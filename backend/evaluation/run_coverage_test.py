from extract_pdf_text import extract_text_from_pdf
from entity_extractor import extract_important_entities
from coverage_evaluator import summary_to_text, calculate_coverage
from sample_data import samples

print("\nINFORMATION COVERAGE EVALUATION\n")

for idx, sample in enumerate(samples, 1):
    print(f"Document {idx}")

    # 1️⃣ Extract full document text
    document_text = extract_text_from_pdf(sample["pdf_path"])

    # 2️⃣ Extract important entities
    document_entities = extract_important_entities(document_text)

    # 3️⃣ Convert summary to plain text
    summary_text = summary_to_text(sample["summary"])

    # 4️⃣ Calculate coverage
    coverage_score, covered_entities = calculate_coverage(
        document_entities, summary_text
    )

    print("Entities in document:", document_entities)
    print("Entities covered in summary:", covered_entities)
    print(f"Coverage Score: {coverage_score * 100:.2f}%")
    print("-" * 45)
