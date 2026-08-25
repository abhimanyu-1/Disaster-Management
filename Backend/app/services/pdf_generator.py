from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import os
import tempfile
from datetime import datetime
from PIL import Image as PILImage, ImageDraw

def create_annotated_image(image_path, bounding_boxes):
    """Draws SAM bounding boxes on the original image."""
    try:
        img = PILImage.open(image_path).convert("RGBA")
        # Create a transparent overlay for the fill
        overlay = PILImage.new('RGBA', img.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(overlay)
        
        width, height = img.size
        
        for bbox in bounding_boxes:
            if not bbox or bbox == [0, 0, 0, 0]:
                continue
                
            ymin, xmin, ymax, xmax = bbox
            px_xmin = (xmin / 1000.0) * width
            px_xmax = (xmax / 1000.0) * width
            px_ymin = (ymin / 1000.0) * height
            px_ymax = (ymax / 1000.0) * height
            
            # Draw semi-transparent red fill and solid red outline
            draw.rectangle([px_xmin, px_ymin, px_xmax, px_ymax], outline=(255, 20, 20, 255), width=3, fill=(255, 20, 20, 60))
            
        # Composite the overlay onto the original image
        img = PILImage.alpha_composite(img, overlay).convert("RGB")
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        img.save(temp_file.name)
        return temp_file.name
    except Exception as e:
        print(f"Error annotating image: {e}")
        return image_path


def draw_header_footer(canvas, doc):
    canvas.saveState()
    # Header
    canvas.setFont('Helvetica-Bold', 10)
    canvas.setFillColor(colors.HexColor("#334155"))
    canvas.drawString(40, 760, "DISASTER MANAGEMENT ENTERPRISE PLATFORM")
    
    canvas.setFont('Helvetica', 9)
    canvas.setFillColor(colors.HexColor("#64748b"))
    canvas.drawRightString(570, 760, "STRICTLY CONFIDENTIAL")
    
    canvas.setStrokeColor(colors.HexColor("#e2e8f0"))
    canvas.setLineWidth(1)
    canvas.line(40, 750, 570, 750)
    
    # Footer
    canvas.line(40, 50, 570, 50)
    canvas.drawString(40, 35, f"Automated Assessment Report - Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    canvas.drawRightString(570, 35, f"Page {doc.page}")
    canvas.restoreState()

def generate_pdf(assessment_data: dict) -> BytesIO:
    buffer = BytesIO()
    # Add margins to accommodate header/footer
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=70, bottomMargin=70)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Heading1'], fontSize=28, spaceAfter=10, textColor=colors.HexColor("#0f172a"), fontName="Helvetica-Bold"
    )
    subtitle_style = ParagraphStyle(
        'CustomSubTitle', parent=styles['Normal'], fontSize=12, spaceAfter=25, textColor=colors.HexColor("#64748b")
    )
    h2_style = ParagraphStyle(
        'CustomH2', parent=styles['Heading2'], fontSize=16, spaceBefore=20, spaceAfter=10, textColor=colors.HexColor("#1e293b"), fontName="Helvetica-Bold"
    )
    normal_style = ParagraphStyle(
        'CustomNormal', parent=styles['Normal'], fontSize=11, spaceAfter=8, textColor=colors.HexColor("#334155")
    )
    
    elements = []
    
    # --- PAGE 1: EXECUTIVE SUMMARY ---
    elements.append(Paragraph("DISASTER ASSESSMENT DOSSIER", title_style))
    elements.append(Paragraph(f"Official Telemetry Report | Reference ID: {assessment_data.get('assessment_id', 'UNKNOWN')}", subtitle_style))
    
    # Severity & Priority Table
    severity = assessment_data.get('assessment', {}).get('severity', 'UNKNOWN')
    priority = assessment_data.get('priority', {}).get('level', 'UNKNOWN')
    
    summary_data = [
        ['Overall Damage Severity', 'Emergency Priority Level'],
        [severity, priority]
    ]
    summary_table = Table(summary_data, colWidths=[265, 265])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (1,0), colors.HexColor("#1e293b")),
        ('TEXTCOLOR', (0,0), (1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 12),
        ('BOTTOMPADDING', (0,0), (-1,0), 10),
        ('TOPPADDING', (0,0), (-1,0), 10),
        
        ('BACKGROUND', (0,1), (1,1), colors.HexColor("#f8fafc")),
        ('TEXTCOLOR', (0,1), (1,1), colors.HexColor("#0f172a")),
        ('FONTNAME', (0,1), (-1,1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,1), (-1,1), 14),
        ('BOTTOMPADDING', (0,1), (-1,1), 12),
        ('TOPPADDING', (0,1), (-1,1), 12),
        
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1"))
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 25))
    
    # Image Section
    image_path = assessment_data.get('image_path')
    vision = assessment_data.get('vision', {})
    bounding_boxes = vision.get('bounding_boxes', [])
    
    elements.append(Paragraph("Aerial Reconnaissance Evidence", h2_style))
    
    if image_path and os.path.exists(image_path):
        annotated_path = image_path
        if bounding_boxes:
            annotated_path = create_annotated_image(image_path, bounding_boxes)
            
        try:
            img = RLImage(annotated_path)
            # Scale image width to exactly 530 (page width minus margins), keep aspect ratio
            aspect = img.drawHeight / img.drawWidth
            img.drawWidth = 530
            img.drawHeight = 530 * aspect
            elements.append(img)
        except Exception as e:
            elements.append(Paragraph(f"[Error rendering image asset: {str(e)}]", normal_style))
    else:
        elements.append(Paragraph("<i>No physical imagery asset was attached to this telemetry.</i>", normal_style))
        
    elements.append(PageBreak())
    
    # --- PAGE 2: DETAILED ANALYTICS ---
    elements.append(Paragraph("Multi-Agent Intelligence Breakdown", title_style))
    elements.append(Spacer(1, 10))
    
    def create_agent_table(title, data_dict):
        elements.append(Paragraph(title, h2_style))
        table_data = []
        for k, v in data_dict:
            table_data.append([Paragraph(f"<b>{k}</b>", normal_style), Paragraph(str(v), normal_style)])
            
        t = Table(table_data, colWidths=[200, 330])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#334155")),
            ('ALIGN', (0,0), (0,-1), 'LEFT'),
            ('ALIGN', (1,0), (1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('INNERGRID', (0,0), (-1,-1), 0.25, colors.HexColor("#e2e8f0")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 15))

    create_agent_table("👁 Agent 01: Vision Recognition", [
        ("Damage Detected", "YES" if vision.get('damage_detected') else "NO"),
        ("Classification Type", vision.get('damage_type', 'N/A').upper()),
        ("Damage Severity Index", str(vision.get('damage_score', 'N/A'))),
        ("AI Confidence Score", f"{vision.get('confidence', 0) * 100:.1f}%"),
        ("Supporting Evidence", ", ".join(vision.get('evidence', [])) if vision.get('evidence') else "None extracted"),
    ])

    geo = assessment_data.get('geo_context', {})
    create_agent_table("🗺 Agent 02: Geospatial Context", [
        ("Affected Population Estimate", f"{geo.get('population_affected', 0):,} residents"),
        ("Infrastructure Criticality", str(geo.get('criticality', 'N/A'))),
        ("Known Flood Zone / Risk Area", "YES - High Risk" if geo.get('flood_zone') else "NO"),
    ])

    claim = assessment_data.get('claim_analysis', {})
    create_agent_table("💰 Agent 03: Fraud & Claim Analysis", [
        ("Claim Consistency", "Consistent with Imagery" if claim.get('consistent') else "Inconsistent / Discrepancy Found"),
        ("Fraud Risk Tier", claim.get('risk', 'UNKNOWN')),
    ])

    decision = assessment_data.get('final_decision', {})
    elements.append(Paragraph("✅ Final Orchestrator Decision", h2_style))
    
    status_val = decision.get('status', 'UNKNOWN')
    status_bg = colors.HexColor("#fee2e2") if status_val in ['REVIEW_REQUIRED', 'REJECTED'] else colors.HexColor("#dcfce7")
    status_text = colors.HexColor("#991b1b") if status_val in ['REVIEW_REQUIRED', 'REJECTED'] else colors.HexColor("#166534")
    
    dec_data = [
        ["DISPATCH STATUS", "RECOMMENDED ACTION"],
        [status_val, decision.get('recommended_action', 'N/A').replace('_', ' ')]
    ]
    
    dec_table = Table(dec_data, colWidths=[265, 265])
    dec_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (1,0), colors.HexColor("#334155")),
        ('TEXTCOLOR', (0,0), (1,0), colors.whitesmoke),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('TOPPADDING', (0,0), (-1,0), 8),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        
        ('BACKGROUND', (0,1), (1,1), status_bg),
        ('TEXTCOLOR', (0,1), (1,1), status_text),
        ('FONTNAME', (0,1), (-1,1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,1), (-1,1), 12),
        ('BOTTOMPADDING', (0,1), (-1,1), 12),
        ('TOPPADDING', (0,1), (-1,1), 12),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#94a3b8")),
    ]))
    
    elements.append(dec_table)

    doc.build(elements, onFirstPage=draw_header_footer, onLaterPages=draw_header_footer)
    buffer.seek(0)
    return buffer
