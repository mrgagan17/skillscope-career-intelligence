from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def generate_pdf_report(user_dict: dict, metrics: dict, advice: dict) -> BytesIO:
    """
    Generates a multi-page, publication-quality PDF career intelligence report.
    Returns a BytesIO stream containing the PDF data.
    """
    buffer = BytesIO()
    
    # Page setup
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=54, leftMargin=54,
        topMargin=54, bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom color palette
    primary_color = colors.HexColor("#0f172a")    # Slate-900
    accent_color = colors.HexColor("#0284c7")     # Sky-600
    secondary_color = colors.HexColor("#0d9488")  # Teal-600
    text_color = colors.HexColor("#334155")       # Slate-700
    bg_light = colors.HexColor("#f8fafc")         # Slate-50
    border_color = colors.HexColor("#cbd5e1")     # Slate-300
    
    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        'ReportTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        alignment=TA_LEFT,
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'ReportSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=accent_color,
        spaceAfter=20
    )
    
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=15,
        spaceAfter=8,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=text_color,
        spaceAfter=10
    )
    
    body_bold = ParagraphStyle(
        'ReportBodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    meta_style = ParagraphStyle(
        'ReportMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#64748b")
    )
    
    story = []
    
    # Header Banner
    story.append(Paragraph("SKILLSCOPE AI", subtitle_style))
    story.append(Paragraph("Career Intelligence & Job Market Analysis", title_style))
    
    # Meta Information Table
    meta_data = [
        [Paragraph(f"<b>Candidate:</b> {user_dict.get('username', 'N/A')}", meta_style), 
         Paragraph(f"<b>Date:</b> {datetime.now().strftime('%B %d, %Y')}", meta_style)],
        [Paragraph(f"<b>Target Role:</b> {user_dict.get('target_role', 'N/A')}", meta_style), 
         Paragraph(f"<b>Status:</b> Market Alignment Report", meta_style)]
    ]
    meta_table = Table(meta_data, colWidths=[250, 250])
    meta_table.setStyle(TableStyle([
        ('LINEBELOW', (0, 1), (-1, 1), 1, border_color),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 20))
    
    # Executive Summary Section
    story.append(Paragraph("Executive Readiness Summary", heading_style))
    summary_text = advice.get('summary', 'Your readiness assessment details are processed below. Review target skills to close your market gaps.')
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 15))
    
    # Key Performance Metrics Table
    story.append(Paragraph("Market Alignment Metrics", heading_style))
    
    # Calculate readiness metrics
    readiness_score = metrics.get('readiness_score', 0.0)
    user_skills_cnt = len(user_dict.get('user_skills', []))
    missing_skills_cnt = len(metrics.get('missing_skills', []))
    avg_salary_val = metrics.get('avg_salary', 0.0)
    
    metrics_data = [
        [Paragraph("<b>Metric</b>", body_bold), Paragraph("<b>Value</b>", body_bold), Paragraph("<b>Status Assessment</b>", body_bold)],
        [
            Paragraph("Target Role Readiness Score", body_style), 
            Paragraph(f"{readiness_score}%", body_bold), 
            Paragraph("Excellent" if readiness_score > 75 else "Good Progress" if readiness_score > 40 else "Action Required", body_style)
        ],
        [
            Paragraph("Skills Catalogued", body_style), 
            Paragraph(str(user_skills_cnt), body_style), 
            Paragraph("Match vs market demands", body_style)
        ],
        [
            Paragraph("Detected Market Gaps", body_style), 
            Paragraph(str(missing_skills_cnt), body_style), 
            Paragraph("Prioritize for career growth", body_style)
        ],
        [
            Paragraph("Target Role Avg Salary", body_style), 
            Paragraph(f"${avg_salary_val:,.2f}", body_style), 
            Paragraph("National average baseline", body_style)
        ]
    ]
    metrics_table = Table(metrics_data, colWidths=[180, 80, 240])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), bg_light),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('ALIGN', (1, 1), (1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 20))
    
    # Skill Profiles Table
    story.append(Paragraph("Detailed Skill Gap Matrix", heading_style))
    
    user_skills_list = ", ".join(user_dict.get('user_skills', [])) if user_dict.get('user_skills') else "None logged"
    missing_skills_list = ", ".join(metrics.get('missing_skills', [])) if metrics.get('missing_skills') else "None detected (Perfect match!)"
    
    skills_matrix_data = [
        [Paragraph("<b>Catalogued Skills</b>", body_bold), Paragraph("<b>Key Skills to Acquire</b>", body_bold)],
        [Paragraph(user_skills_list, body_style), Paragraph(missing_skills_list, body_style)]
    ]
    skills_matrix_table = Table(skills_matrix_data, colWidths=[250, 250])
    skills_matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), bg_light),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(skills_matrix_table)
    
    # Page Break for Roadmap
    story.append(PageBreak())
    
    # Page 2: Strategic Roadmap & Execution Action plan
    story.append(Paragraph("SKILLSCOPE AI", subtitle_style))
    story.append(Paragraph("AI-Powered Personalized Learning Path", title_style))
    story.append(Spacer(1, 15))
    
    # Learning Priorities
    story.append(Paragraph("Primary Technical Priorities", heading_style))
    prio_list = advice.get('learning_priorities', [])
    for prio in prio_list:
        story.append(Paragraph(f"• {prio}", body_style))
    story.append(Spacer(1, 15))
    
    # 3-Month Roadmap
    story.append(Paragraph("3-Month Learning & Projects Roadmap", heading_style))
    roadmap_list = advice.get('roadmap', [])
    for step in roadmap_list:
        story.append(Paragraph(f"<b>{step.split(':')[0] if ':' in step else 'Step'}</b>", body_bold))
        story.append(Paragraph(step.split(':', 1)[1].strip() if ':' in step else step, body_style))
        story.append(Spacer(1, 8))
    story.append(Spacer(1, 15))
    
    # Job Search Strategy
    story.append(Paragraph("Strategic Actionable Advice", heading_style))
    strategy_list = advice.get('job_strategy', [])
    for strat in strategy_list:
        story.append(Paragraph(f"✓ {strat}", body_style))
        
    # Build Document
    doc.build(story)
    buffer.seek(0)
    return buffer
