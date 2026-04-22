# report_generator.py
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.units import inch


def generate_pdf_report(
    output_path: str,
    summary_text: str,
    clauses: list,
    risks: list
):
    """
    Generates a professional legal analysis PDF report.
    """

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    story = []

    # --------------------------------------------------
    # TITLE
    # --------------------------------------------------
    story.append(Paragraph("<b>Legal Document Analysis Report</b>", styles["Title"]))
    story.append(Spacer(1, 0.3 * inch))

    # --------------------------------------------------
    # SUMMARY
    # --------------------------------------------------
    story.append(Paragraph("<b>Executive Summary</b>", styles["Heading2"]))
    story.append(Spacer(1, 0.15 * inch))

    summary_points = [
        Paragraph(point, styles["Normal"])
        for point in summary_text.split("\n") if point.strip()
    ]

    story.append(ListFlowable(
        summary_points,
        bulletType="bullet",
        start="circle",
        leftIndent=20
    ))

    story.append(Spacer(1, 0.3 * inch))

    # --------------------------------------------------
    # CLAUSES
    # --------------------------------------------------
    if clauses:
        story.append(Paragraph("<b>Identified Clauses</b>", styles["Heading2"]))
        story.append(Spacer(1, 0.15 * inch))

        for idx, clause in enumerate(clauses, 1):
            story.append(
                Paragraph(
                    f"<b>Clause {idx}: {clause.get('title')}</b>",
                    styles["Heading4"]
                )
            )
            story.append(
                Paragraph(
                    clause.get("description", ""),
                    styles["Normal"]
                )
            )
            story.append(Spacer(1, 0.15 * inch))

        story.append(Spacer(1, 0.3 * inch))

    # --------------------------------------------------
    # RISKS
    # --------------------------------------------------
    if risks:
        story.append(Paragraph("<b>Risk Assessment</b>", styles["Heading2"]))
        story.append(Spacer(1, 0.15 * inch))

        for risk in risks:
            story.append(
                Paragraph(
                    f"<b>Risk:</b> {risk.get('risk')} "
                    f"(<b>{risk.get('risk_level')}</b>)",
                    styles["Normal"]
                )
            )
            story.append(
                Paragraph(
                    f"<b>Description:</b> {risk.get('description')}",
                    styles["Normal"]
                )
            )
            story.append(
                Paragraph(
                    f"<b>Mitigation:</b> {risk.get('mitigation_strategy')}",
                    styles["Normal"]
                )
            )
            story.append(Spacer(1, 0.2 * inch))

    # --------------------------------------------------
    # BUILD PDF
    # --------------------------------------------------
    doc.build(story)
