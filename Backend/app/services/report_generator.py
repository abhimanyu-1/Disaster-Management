from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from ..schemas.assessment import FinalAssessment
import datetime

def generate_pdf_report(assessment: FinalAssessment) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'ReportTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'ReportSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=12
    )

    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    bold_body_style = ParagraphStyle(
        'ReportBoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    elements = []

    # 1. Header Banner
    elements.append(Paragraph("DISASTER DAMAGE ASSESSMENT DOSSIER", title_style))
    date_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
    elements.append(Paragraph(f"<b>Assessment ID:</b> {assessment.assessment_id} | <b>Generated:</b> {date_str} | <b>Engine:</b> DisasterAI Multi-Agent Pipeline", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#E2E8F0'), spaceAfter=12))

    # 2. Executive Summary Table
    sev_color = colors.HexColor('#EF4444') if assessment.assessment.severity in ['HIGH', 'CRITICAL'] else (
        colors.HexColor('#F59E0B') if assessment.assessment.severity == 'MEDIUM' else colors.HexColor('#10B981')
    )

    summary_data = [
        [
            Paragraph("<b>DISASTER TYPE</b>", bold_body_style),
            Paragraph(assessment.vision.damage_type.upper(), body_style),
            Paragraph("<b>SEVERITY LEVEL</b>", bold_body_style),
            Paragraph(f"<font color='{sev_color.hexval()}'><b>{assessment.assessment.severity} ({assessment.assessment.severity_score})</b></font>", bold_body_style),
        ],
        [
            Paragraph("<b>THREAT / PRIORITY</b>", bold_body_style),
            Paragraph(f"<b>{assessment.priority.level} ({assessment.priority.score})</b>", bold_body_style),
            Paragraph("<b>FINAL DECISION</b>", bold_body_style),
            Paragraph(f"<b>{assessment.final_decision.status}</b>", bold_body_style),
        ],
        [
            Paragraph("<b>DAMAGE DETECTED</b>", bold_body_style),
            Paragraph("YES" if assessment.vision.damage_detected else "NO", body_style),
            Paragraph("<b>RECOMMENDED ACTION</b>", bold_body_style),
            Paragraph(assessment.final_decision.recommended_action.replace('_', ' '), body_style),
        ]
    ]

    summary_table = Table(summary_data, colWidths=[120, 150, 130, 140])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 14))

    # 3. Agent 01 & 02: Vision & SAM Spatial Localization
    elements.append(Paragraph("1. Visual Analysis & SAM Spatial Localization", heading_style))
    bbox_str = f"[{', '.join([str(round(x, 1)) for x in assessment.vision.bounding_box])}]" if assessment.vision.bounding_box else "[N/A]"
    
    vision_data = [
        [Paragraph("<b>Model Backend:</b>", bold_body_style), Paragraph("Google Gemini 2.5 Flash + HuggingFace SAM-ViT", body_style)],
        [Paragraph("<b>Damage Score:</b>", bold_body_style), Paragraph(str(assessment.vision.damage_score), body_style)],
        [Paragraph("<b>Vision Confidence:</b>", bold_body_style), Paragraph(f"{round(assessment.vision.confidence * 100, 1)}%", body_style)],
        [Paragraph("<b>SAM Refined BBox:</b>", bold_body_style), Paragraph(bbox_str, body_style)],
    ]
    vision_table = Table(vision_data, colWidths=[150, 390])
    vision_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(vision_table)

    if assessment.vision.evidence:
        elements.append(Spacer(1, 4))
        evidence_text = "<b>Detected Visual Evidence:</b> " + " • ".join(assessment.vision.evidence)
        elements.append(Paragraph(evidence_text, body_style))

    elements.append(Spacer(1, 10))

    # 4. Agent 03 & 04: Geo Context & Claim Triage
    elements.append(Paragraph("2. Geographical Context & Claim Consistency", heading_style))
    geo_claim_data = [
        [
            Paragraph("<b>Affected Population:</b>", bold_body_style),
            Paragraph(f"{assessment.geo_context.population_affected:,} residents", body_style),
            Paragraph("<b>Claim Risk Tier:</b>", bold_body_style),
            Paragraph(assessment.claim_analysis.risk, body_style),
        ],
        [
            Paragraph("<b>Infrastructure Criticality:</b>", bold_body_style),
            Paragraph(str(assessment.geo_context.criticality), body_style),
            Paragraph("<b>Evidence Consistency:</b>", bold_body_style),
            Paragraph("Consistent" if assessment.claim_analysis.consistent else "Discrepancy Flagged", body_style),
        ],
        [
            Paragraph("<b>Flood Risk Zone:</b>", bold_body_style),
            Paragraph("High Risk Floodplain" if assessment.geo_context.flood_zone else "Standard Terrain", body_style),
            Paragraph("<b>Verification Required:</b>", bold_body_style),
            Paragraph("Yes (Human Review)" if assessment.verification.required else "No (Auto-Approved)", body_style),
        ],
    ]
    geo_claim_table = Table(geo_claim_data, colWidths=[140, 130, 130, 140])
    geo_claim_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(geo_claim_table)
    elements.append(Spacer(1, 14))

    # 5. Guardrails & Audit Notice
    elements.append(Paragraph("3. Operational Guardrail & Audit Sign-Off", heading_style))
    audit_text = (
        f"This report was compiled deterministically by the DisasterAI Multi-Agent Workflow Engine. "
        f"Verification recommendation is <b>{assessment.verification.action}</b>. "
        f"All model outputs, spatial localized coordinates, and claims cross-references are archived under record ID <b>{assessment.assessment_id}</b>."
    )
    elements.append(Paragraph(audit_text, body_style))
    elements.append(Spacer(1, 14))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=8))
    elements.append(Paragraph("Official Disaster Emergency Operations Center Report • Generated by DisasterAI", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#94A3B8'), alignment=1)))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
