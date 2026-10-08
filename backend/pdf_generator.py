import os
import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    Flowable,
)
from reportlab.pdfgen import canvas

PAGE_WIDTH, PAGE_HEIGHT = A4  # 595.2755737304688, 841.8897705078125

# Exact theme colors matching official reference PDF
ORANGE_THEME = colors.HexColor('#F36A21')
TITLE_DARK = colors.HexColor('#222222')
TEXT_LABEL = colors.HexColor('#666666')
TEXT_BODY = colors.HexColor('#333333')
LINE_COLOR = colors.HexColor('#E7D2BF')
ROW_LIGHT = colors.HexColor('#FFF8F2')
ROW_WHITE = colors.HexColor('#FFFFFF')
SIG_LINE_COLOR = colors.HexColor('#E7D2BF')

# Default 8 terms as fallback
DEFAULT_TERMS = [
    {
        "title": "Payment & Payout",
        "description": "The company will make the payout to the same account from which you have made the payment to the company.",
        "enabled": True,
    },
    {
        "title": "Lock-in Period",
        "description": "The lock-in period will be 6 months.",
        "enabled": True,
    },
    {
        "title": "Withdrawal of Amount",
        "description": "After completion of the 6-month lock-in period, if you want to withdraw your amount, you have to inform the company 10 days in advance. After submitting the withdrawal request, you will receive your amount within 10 working days.",
        "enabled": True,
    },
    {
        "title": "TDS",
        "description": "TDS will be deducted from your P&L as per Government rules. When you file your income tax return, the deducted TDS amount will be available in your account as per the Government rules.",
        "enabled": True,
    },
    {
        "title": "Risk Sharing",
        "description": "The amount given by you to the company will have 50% risk for the customer and 50% risk for the company.",
        "enabled": True,
    },
    {
        "title": "Market Conditions",
        "description": "The return on the amount given by you to the company will depend on the market conditions.",
        "enabled": True,
    },
    {
        "title": "Purpose of These Terms & Conditions",
        "description": "The above Terms & Conditions are provided only for customer reference and understanding. This document cannot be used as a legal document or for any legal purpose.",
        "enabled": True,
    },
    {
        "title": "Legal Jurisdiction",
        "description": "For any legal matter related to the company, the jurisdiction will be Ahmedabad, Gujarat.",
        "enabled": True,
    },
]


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and stamp the total number of pages
    (Page X of Y) in the bottom-right orange angle polygon.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pages = []

    def showPage(self):
        self.pages.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        page_count = len(self.pages)
        for page in self.pages:
            self.__dict__.update(page)
            self.saveState()
            self.setFont("Helvetica", 6.5)
            self.setFillColor(colors.HexColor('#777777'))
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(557.3, 841.88977 - 815.8, page_text)
            self.restoreState()
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)


def draw_background(canvas_obj, doc):
    """
    Draws the high-resolution official Kanak Infosys letterhead background
    containing the header logo, contact details, watermark graph, and footer address.
    """
    canvas_obj.saveState()
    base_dir = os.path.dirname(os.path.abspath(__file__))
    bg_path = os.path.join(base_dir, 'assets', 'customer_deposit_theme_bg.jpg')
    if not os.path.exists(bg_path):
        bg_path = os.path.join(base_dir, '..', 'frontend', 'public', 'assets', 'customer_deposit_theme_bg.jpg')
    if os.path.exists(bg_path):
        canvas_obj.drawImage(bg_path, 0, 0, width=PAGE_WIDTH, height=PAGE_HEIGHT, preserveAspectRatio=False)
    canvas_obj.restoreState()


class BottomPinnedSignature(Flowable):
    """
    Anchors the signature block cleanly towards the bottom of the final page,
    above the footer, matching the official visual reference.
    """
    def __init__(self, table):
        super().__init__()
        self.table = table

    def wrap(self, availWidth, availHeight):
        w, h = self.table.wrap(availWidth, availHeight)
        self.w = w
        self.h = h
        # Expand height to pin signature table neatly to the bottom of the page
        target_height = max(h, availHeight - 5)
        return w, target_height

    def draw(self):
        self.table.drawOn(self.canv, 0, 0)


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


def generate_deposit_form_pdf(client_data: dict, terms_list: list = None) -> bytes:
    """
    Generates the official Kanak Infosys Customer Deposit Form PDF matching
    'Customer_Deposit_Form_KNK0052_New_Theme (2).pdf' exactly.
    
    Dynamic features:
    - Dynamic client details (Customer Name, Customer ID, Account Opening Date, Locking End Date, Amount, Payment Type, Remark)
    - Dynamic Terms & Conditions fetched from database (active terms in current order)
    - Automatic dynamic numbering (1 to N)
    - Clean multi-page pagination with ReportLab story flow
    - Two-pass canvas for Page X of Y in the bottom-right polygon
    """
    buffer = io.BytesIO()
    now = datetime.now()
    
    customer_name = (client_data.get('name') or '—').upper()
    customer_id = (client_data.get('client_id') or '—').upper()
    acct_opening = client_data.get('account_opening_date') or now.strftime('%d/%m/%Y')
    lock_end = client_data.get('locking_period_end_date') or ''
    raw_amt = client_data.get('amount', 0)
    amt_str = f"Rs. {format_inr_amount(raw_amt)}"
    payment_type = client_data.get('payment_type') or 'Cash'
    remark = client_data.get('remark') or 'SHIVAM'

    # Filter and sort enabled terms
    raw_terms = terms_list if (terms_list is not None and len(terms_list) > 0) else DEFAULT_TERMS
    active_terms = [t for t in raw_terms if t.get('enabled', True) is True]
    if not active_terms:
        active_terms = DEFAULT_TERMS

    # Setup document template with margins tuned to clear header & footer letterhead graphics
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=48,
        rightMargin=48,
        topMargin=135,
        bottomMargin=165,
    )
    
    content_w = PAGE_WIDTH - 96  # 499.28 pt
    story = []

    # 1. Main Title
    title_style = ParagraphStyle(
        name='MainTitle',
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=TITLE_DARK,
        alignment=1,
    )
    sub_title_style = ParagraphStyle(
        name='SubTitle',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=ORANGE_THEME,
        alignment=1,
    )
    story.append(Paragraph('CUSTOMER DEPOSIT FORM', title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph('KANAK INFOSYS', sub_title_style))
    story.append(Spacer(1, 14))

    # 2. Section Heading: CUSTOMER DETAILS
    sec_heading_style = ParagraphStyle(
        name='SecHeading',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=ORANGE_THEME,
    )
    story.append(Paragraph('CUSTOMER DETAILS', sec_heading_style))
    story.append(Spacer(1, 4))

    # Divider line
    div_table = Table([['']], colWidths=[content_w], rowHeights=[0.75])
    div_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LINE_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(div_table)
    story.append(Spacer(1, 6))

    # 3. Zebra-striped Customer Details Table
    lbl_style = ParagraphStyle(
        name='DetailLbl',
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=10,
        textColor=TEXT_LABEL,
    )
    val_style = ParagraphStyle(
        name='DetailVal',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=TITLE_DARK,
    )

    details_fields = [
        ('CUSTOMER NAME', customer_name),
        ('CUSTOMER ID', customer_id),
        ('ACCOUNT OPENING DATE', acct_opening),
        ('LOCKING PERIOD END DATE', lock_end),
        ('AMOUNT', amt_str),
        ('PAYMENT TYPE', payment_type),
        ('REMARK', remark),
    ]

    table_data = []
    for lbl, val in details_fields:
        table_data.append([
            Paragraph(lbl, lbl_style),
            Paragraph(val, val_style),
        ])

    col1_w = 155
    col2_w = content_w - col1_w
    cust_table = Table(table_data, colWidths=[col1_w, col2_w], rowHeights=[24] * len(details_fields))
    cust_table_style = [
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]
    for idx in range(len(details_fields)):
        bg = ROW_LIGHT if idx % 2 == 0 else ROW_WHITE
        cust_table_style.append(('BACKGROUND', (0, idx), (-1, idx), bg))

    cust_table.setStyle(TableStyle(cust_table_style))
    story.append(cust_table)
    story.append(Spacer(1, 14))

    # 4. Section Heading: TERMS & CONDITIONS
    story.append(Paragraph('TERMS & CONDITIONS', sec_heading_style))
    story.append(Spacer(1, 4))
    story.append(div_table)
    story.append(Spacer(1, 10))

    # 5. Terms Points (Dynamic numbered list)
    term_title_style = ParagraphStyle(
        name='TermTitle',
        fontName='Helvetica-Bold',
        fontSize=8.6,
        leading=12,
        textColor=TITLE_DARK,
        leftIndent=7,
    )
    term_desc_style = ParagraphStyle(
        name='TermDesc',
        fontName='Helvetica',
        fontSize=8.0,
        leading=11.5,
        textColor=TEXT_BODY,
        leftIndent=24,
    )

    for idx, term in enumerate(active_terms, start=1):
        t_title = term.get('title') or f"Point {idx}"
        t_desc = term.get('description') or ""
        point_flow = [
            Paragraph(f"<b>{idx}. {t_title}</b>", term_title_style),
            Spacer(1, 2),
            Paragraph(t_desc, term_desc_style),
            Spacer(1, 8),
        ]
        story.append(KeepTogether(point_flow))

    # 6. Bottom Signatures Block
    sig_lbl_style = ParagraphStyle(
        name='SigLabel',
        fontName='Helvetica',
        fontSize=8.0,
        leading=10,
        textColor=TITLE_DARK,
        alignment=1,
    )

    sig_line_w = 190
    sig_gap = content_w - (sig_line_w * 2)

    sig_table_data = [
        [
            Table([['']], colWidths=[sig_line_w], rowHeights=[0.75]),
            '',
            Table([['']], colWidths=[sig_line_w], rowHeights=[0.75]),
        ],
        [
            Paragraph('Customer Signature', sig_lbl_style),
            '',
            Paragraph('Authorised Signatory — Kanak Infosys', sig_lbl_style),
        ]
    ]
    sig_table = Table(
        sig_table_data,
        colWidths=[sig_line_w, sig_gap, sig_line_w],
        rowHeights=[2, 16],
    )
    sig_table.setStyle(TableStyle([
        ('LINEBEFORE', (0, 0), (0, 0), 0, colors.transparent),
        ('BACKGROUND', (0, 0), (0, 0), SIG_LINE_COLOR),
        ('BACKGROUND', (2, 0), (2, 0), SIG_LINE_COLOR),
        ('ALIGN', (0, 1), (-1, 1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))

    story.append(BottomPinnedSignature(sig_table))

    # Build document
    doc.build(
        story,
        canvasmaker=NumberedCanvas,
        onFirstPage=draw_background,
        onLaterPages=draw_background,
    )

    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
