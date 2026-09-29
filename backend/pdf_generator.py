import os
import io
from datetime import datetime
from dateutil.relativedelta import relativedelta
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    PageBreak,
)
from reportlab.pdfgen import canvas

PAGE_WIDTH, PAGE_HEIGHT = A4

GOLD_BORDER = colors.HexColor('#9B783E')
DARK_HEADER_BG = colors.HexColor('#161311')
GOLD_ACCENT = colors.HexColor('#9B783E')
ROW_BG_LIGHT = colors.HexColor('#F9F6F0')
ROW_BG_WHITE = colors.HexColor('#FFFFFF')
TEXT_MUTED = colors.HexColor('#6B6661')
TEXT_DARK = colors.HexColor('#1A1A1A')


def draw_page_decorations(canvas_obj: canvas.Canvas, doc, generated_date_str: str, page_num: int, total_pages: int = 2):
    canvas_obj.saveState()
    canvas_obj.setStrokeColor(GOLD_BORDER)
    canvas_obj.setLineWidth(1.5)
    canvas_obj.rect(22, 22, PAGE_WIDTH - 44, PAGE_HEIGHT - 44)

    canvas_obj.setLineWidth(0.75)
    canvas_obj.rect(26, 26, PAGE_WIDTH - 52, PAGE_HEIGHT - 52)

    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.setFillColor(colors.HexColor('#777777'))
    canvas_obj.drawString(38, 36, f'Generated on {generated_date_str}')
    canvas_obj.drawRightString(PAGE_WIDTH - 38, 36, f'Page {page_num} of {total_pages}')
    canvas_obj.restoreState()


def format_inr_amount(amt) -> str:
    try:
        val = int(round(float(amt)))
    except (ValueError, TypeError):
        return str(amt or '0')
    
    s = str(abs(val))
    if len(s) <= 3:
        formatted = s
    else:
        last3 = s[-3:]
        remaining = s[:-3]
        groups = []
        while len(remaining) > 2:
            groups.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        if remaining:
            groups.insert(0, remaining)
        formatted = ','.join(groups) + ',' + last3
    
    return f'-{formatted}' if val < 0 else formatted


def generate_deposit_form_pdf(client_data: dict) -> bytes:
    buffer = io.BytesIO()
    now = datetime.now()
    generated_date_str = client_data.get('generated_date') or f'{now.day}/{now.month}/{now.year}'
    
    customer_name = (client_data.get('name') or '—').upper()
    customer_id = (client_data.get('client_id') or '—').upper()
    
    acct_opening = client_data.get('account_opening_date')
    if not acct_opening:
        acct_opening = now.strftime('%d/%m/%Y')
        
    lock_end = client_data.get('locking_period_end_date')
    if not lock_end:
        try:
            d_obj = datetime.strptime(acct_opening, '%d/%m/%Y')
            end_obj = d_obj + relativedelta(months=6)
            lock_end = end_obj.strftime('%d/%m/%Y')
        except Exception:
            lock_end = (now + relativedelta(months=6)).strftime('%d/%m/%Y')

    raw_amt = client_data.get('amount', 0)
    amt_str = f'Rs. {format_inr_amount(raw_amt)}'

    payment_type = client_data.get('payment_type') or 'Cash'
    remark = client_data.get('remark') or 'SHIVAM'

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=26,
        rightMargin=26,
        topMargin=26,
        bottomMargin=46,
    )

    story = []

    header_w = PAGE_WIDTH - 52
    header_h = 68

    base_dir = os.path.dirname(os.path.abspath(__file__))
    logo_path = os.path.join(base_dir, 'assets', 'kanak-logo.png')
    if not os.path.exists(logo_path):
        logo_path = os.path.join(base_dir, '..', 'frontend', 'public', 'assets', 'kanak-logo.png')
    
    logo_flowable = None
    if os.path.exists(logo_path):
        logo_flowable = RLImage(logo_path, width=120, height=37.5)

    header_title_p = Paragraph(
        "<font face='Times-Bold' size=16 color='white'><b>CUSTOMER DEPOSITE FORM</b></font><br/>"
        "<font face='Helvetica' size=8 color='#E3D6C5'><b>K&nbsp;A&nbsp;N&nbsp;A&nbsp;K&nbsp;&nbsp;&nbsp;I&nbsp;N&nbsp;F&nbsp;O&nbsp;S&nbsp;Y&nbsp;S</b></font>",
        ParagraphStyle(
            name='HeaderRight',
            alignment=2,
            leading=18,
        )
    )

    header_table = Table(
        [[logo_flowable or '', header_title_p]],
        colWidths=[150, header_w - 150],
        rowHeights=[header_h]
    )
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), DARK_HEADER_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (0, 0), 16),
        ('RIGHTPADDING', (-1, -1), (-1, -1), 16),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)

    accent_bar = Table([['']], colWidths=[header_w], rowHeights=[3.5])
    accent_bar.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GOLD_ACCENT),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(accent_bar)

    story.append(Spacer(1, 16))

    body_w = header_w - 36

    details_heading = Paragraph(
        "<font face='Helvetica-Bold' size=9.5 color='#9B783E'><b>C&nbsp;U&nbsp;S&nbsp;T&nbsp;O&nbsp;M&nbsp;E&nbsp;R&nbsp;&nbsp;&nbsp;D&nbsp;E&nbsp;T&nbsp;A&nbsp;I&nbsp;L&nbsp;S</b></font>",
        ParagraphStyle(name='SecHeading1', leading=13, leftIndent=18)
    )
    story.append(details_heading)
    story.append(Spacer(1, 8))

    label_style = ParagraphStyle(
        name='TableLabel',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=TEXT_MUTED,
    )
    val_style = ParagraphStyle(
        name='TableVal',
        fontName='Times-Bold',
        fontSize=10,
        leading=12,
        textColor=TEXT_DARK,
    )
    remark_style = ParagraphStyle(
        name='TableRemark',
        fontName='Times-BoldItalic',
        fontSize=9.5,
        leading=12,
        textColor=TEXT_DARK,
    )

    table_data = [
        [
            Paragraph('CUSTOMER NAME', label_style),
            Paragraph(customer_name, val_style),
        ],
        [
            Paragraph('CUSTOMER ID', label_style),
            Paragraph(customer_id, val_style),
        ],
        [
            Paragraph('ACCOUNT OPENING DATE', label_style),
            Paragraph(acct_opening, val_style),
        ],
        [
            Paragraph('LOCKING PERIOD END DATE', label_style),
            Paragraph(lock_end, val_style),
        ],
        [
            Paragraph('AMOUNT', label_style),
            Paragraph(amt_str, val_style),
        ],
        [
            Paragraph('PAYMENT TYPE', label_style),
            Paragraph(payment_type, val_style),
        ],
        [
            Paragraph('REMARK<br/><font size=7 color="#A09B95">&nbsp;</font>', label_style),
            Paragraph(remark, remark_style),
        ],
    ]

    col1_w = 175
    col2_w = body_w - col1_w
    details_table = Table(table_data, colWidths=[col1_w, col2_w])
    details_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ROW_BG_LIGHT),
        ('BACKGROUND', (0, 1), (-1, 1), ROW_BG_WHITE),
        ('BACKGROUND', (0, 2), (-1, 2), ROW_BG_LIGHT),
        ('BACKGROUND', (0, 3), (-1, 3), ROW_BG_WHITE),
        ('BACKGROUND', (0, 4), (-1, 4), ROW_BG_LIGHT),
        ('BACKGROUND', (0, 5), (-1, 5), ROW_BG_WHITE),
        ('BACKGROUND', (0, 6), (-1, 6), ROW_BG_LIGHT),
        
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (0, -1), 10),
        ('LEFTPADDING', (1, 0), (1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 5.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5.5),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, colors.HexColor('#F0EAE1')),
    ]))

    container_table = Table([[details_table]], colWidths=[header_w])
    container_table.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 18),
        ('RIGHTPADDING', (0, 0), (-1, -1), 18),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(container_table)

    story.append(Spacer(1, 14))

    sep_line = Table([['']], colWidths=[body_w], rowHeights=[0.75])
    sep_line.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#E2D5C3')),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    sep_container = Table([[sep_line]], colWidths=[header_w])
    sep_container.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 18),
        ('RIGHTPADDING', (0, 0), (-1, -1), 18),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(sep_container)

    story.append(Spacer(1, 12))

    terms_heading = Paragraph(
        "<font face='Helvetica-Bold' size=9.5 color='#9B783E'><b>T&nbsp;E&nbsp;R&nbsp;M&nbsp;S&nbsp;&nbsp;&nbsp;&amp;&nbsp;&nbsp;&nbsp;C&nbsp;O&nbsp;N&nbsp;D&nbsp;I&nbsp;T&nbsp;I&nbsp;O&nbsp;N&nbsp;S</b></font>",
        ParagraphStyle(name='SecHeading2', leading=13, leftIndent=18)
    )
    story.append(terms_heading)
    story.append(Spacer(1, 8))

    term_title_style = ParagraphStyle(
        name='TermTitle',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK,
        leftIndent=18,
        rightIndent=18,
    )
    term_body_style = ParagraphStyle(
        name='TermBody',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#2B2724'),
        leftIndent=34,
        rightIndent=18,
    )

    story.append(Paragraph('<b>1.&nbsp;&nbsp;Payment &amp; Payout:</b>', term_title_style))
    story.append(Paragraph('The company will make the payout to the same account from which you have made the payment to the company.', term_body_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>2.&nbsp;&nbsp;Lock-in Period:</b>', term_title_style))
    story.append(Paragraph('The lock-in period will be 6 months.', term_body_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>3.&nbsp;&nbsp;Withdrawal of Amount:</b>', term_title_style))
    story.append(Paragraph('After completion of the 6-month lock-in period, if you want to withdraw your amount, you have to inform the company 10 days in advance. After submitting the withdrawal request, you will receive your amount within 10 working days.', term_body_style))

    story.append(PageBreak())

    story.append(Spacer(1, 26))

    story.append(Paragraph('<b>4.&nbsp;&nbsp;TDS:</b>', term_title_style))
    story.append(Paragraph('TDS will be deducted from your P&amp;L as per Government rules. When you file your income tax return, the deducted TDS amount will be available in your account as per the Government rules.', term_body_style))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>5.&nbsp;&nbsp;Risk Sharing:</b>', term_title_style))
    story.append(Paragraph('The amount given by you to the company will have 50% risk for the customer and 50% risk for the company.', term_body_style))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>6.&nbsp;&nbsp;Market Conditions:</b>', term_title_style))
    story.append(Paragraph('The return on the amount given by you to the company will depend on the market conditions.', term_body_style))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>7.&nbsp;&nbsp;Purpose of These Terms &amp; Conditions:</b>', term_title_style))
    story.append(Paragraph('The above Terms &amp; Conditions are provided only for customer reference and understanding. This document cannot be used as a legal document or for any legal purpose.', term_body_style))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>8.&nbsp;&nbsp;Legal Jurisdiction:</b>', term_title_style))
    story.append(Paragraph('For any legal matter related to the company, the jurisdiction will be Ahmedabad, Gujarat.', term_body_style))

    story.append(Spacer(1, 180))

    sig_customer_p = Paragraph(
        "<font face='Helvetica' size=9 color='#2B2724'>Customer Signature</font>",
        ParagraphStyle(name='SigCustomer', alignment=0)
    )
    sig_auth_p = Paragraph(
        "<font face='Helvetica' size=9 color='#2B2724'>Authorised Signatory &mdash; Kanak Infosys</font>",
        ParagraphStyle(name='SigAuth', alignment=2)
    )
    sig_table = Table([[sig_customer_p, sig_auth_p]], colWidths=[body_w / 2, body_w / 2])
    sig_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))

    sig_container = Table([[sig_table]], colWidths=[header_w])
    sig_container.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 18),
        ('RIGHTPADDING', (0, 0), (-1, -1), 18),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(sig_container)

    def make_canvas_decorations(canvas_obj, document):
        draw_page_decorations(
            canvas_obj,
            document,
            generated_date_str=generated_date_str,
            page_num=document.page,
            total_pages=2,
        )

    doc.build(
        story,
        onFirstPage=make_canvas_decorations,
        onLaterPages=make_canvas_decorations,
    )

    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
