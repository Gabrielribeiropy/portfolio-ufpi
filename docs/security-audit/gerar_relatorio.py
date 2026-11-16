"""Gera o PDF do relatório de auditoria sem alterar o código da vitrine."""
from pathlib import Path
from xml.sax.saxutils import escape
import re

from reportlab.graphics.shapes import Circle, Drawing, Rect, String
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
)

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "relatorio-auditoria-seguranca.md"
OUTPUT = ROOT / "relatorio-auditoria-seguranca.pdf"
source_lines = SOURCE.read_text(encoding="utf-8").splitlines()
report_title = source_lines[0].lstrip("# ")
verdict_match = re.search(r"\*\*(APTO|COM RESSALVAS|BLOQUEADO)[^*]*\*\*", "\n".join(source_lines))
verdict = verdict_match.group(0).strip("*") if verdict_match else "Veredito no relatório"
FONT = Path("C:/Windows/Fonts/arial.ttf")
BOLD = Path("C:/Windows/Fonts/arialbd.ttf")
if FONT.exists() and BOLD.exists():
    pdfmetrics.registerFont(TTFont("Audit", str(FONT)))
    pdfmetrics.registerFont(TTFont("Audit-Bold", str(BOLD)))
else:
    FONT_NAME, BOLD_NAME = "Helvetica", "Helvetica-Bold"
if FONT.exists() and BOLD.exists():
    FONT_NAME, BOLD_NAME = "Audit", "Audit-Bold"

NAVY = colors.HexColor("#183b3b")
GREEN = colors.HexColor("#0a705a")
MUTED = colors.HexColor("#667d80")
LINE = colors.HexColor("#d9e6e2")
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="AuditTitle", fontName=BOLD_NAME, fontSize=22, leading=27, textColor=NAVY, spaceAfter=14))
styles.add(ParagraphStyle(name="AuditH1", fontName=BOLD_NAME, fontSize=13, leading=17, textColor=NAVY, spaceBefore=17, spaceAfter=7))
styles.add(ParagraphStyle(name="AuditH2", fontName=BOLD_NAME, fontSize=10, leading=14, textColor=GREEN, spaceBefore=12, spaceAfter=5))
styles.add(ParagraphStyle(name="AuditBody", fontName=FONT_NAME, fontSize=8.3, leading=12.5, textColor=NAVY, spaceAfter=6))
styles.add(ParagraphStyle(name="AuditCell", parent=styles["AuditBody"], fontSize=7.3, leading=10, spaceAfter=0))
styles.add(ParagraphStyle(name="AuditSmall", parent=styles["AuditBody"], fontSize=7.3, leading=10, textColor=MUTED))

def clean(line):
    for symbol, label in (("✅", "[OK]"), ("◻️", "[N/A]"), ("⚠️", "[PARCIAL]"), ("❓", "[?]")):
        line = line.replace(symbol, label)
    return escape(line.replace("**", "").replace("`", ""))

def paragraph(line, style="AuditBody"):
    return Paragraph(clean(line), styles[style])

def make_table(lines, width):
    rows = [[cell.strip() for cell in line.strip().strip("|").split("|")] for line in lines]
    rows = [row for row in rows if not all(set(cell) <= set("-: ") for cell in row)]
    if not rows:
        return Spacer(1, 1)
    columns = max(map(len, rows))
    if columns == 3:
        widths = [3.0 * cm, 3.2 * cm, width - 6.2 * cm]
    elif columns == 2:
        widths = [4.4 * cm, width - 4.4 * cm]
    elif columns == 4:
        widths = [2.0 * cm, 3.2 * cm, 3.0 * cm, width - 8.2 * cm]
    else:
        widths = [width / columns] * columns
    cells = [[paragraph(row[i] if i < len(row) else "", "AuditCell") for i in range(columns)] for row in rows]
    table = Table(cells, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e9f5ef")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.3, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(2 * cm, 1.6 * cm, A4[0] - 2 * cm, 1.6 * cm)
    canvas.setFillColor(MUTED)
    canvas.setFont(FONT_NAME, 7)
    canvas.drawString(2 * cm, 1.2 * cm, "Auditoria pré-publicação | 16/11/2026")
    canvas.drawRightString(A4[0] - 2 * cm, 1.2 * cm, str(doc.page))
    canvas.restoreState()

doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm,
                        topMargin=2 * cm, bottomMargin=2 * cm)
width = A4[0] - 4 * cm
story = [
    paragraph(report_title, "AuditTitle"),
    paragraph("16 de novembro de 2026"),
    paragraph("VEREDITO: " + verdict, "AuditH1"),
    paragraph("Detalhes, cobertura e limitações nas páginas seguintes."),
    Spacer(1, 12),
]
chart = Drawing(width, 100)
chart.add(Circle(58, 49, 35, fillColor=colors.white, strokeColor=GREEN, strokeWidth=9))
chart.add(String(58, 43, "0", fontName=BOLD_NAME, fontSize=21, textAnchor="middle", fillColor=NAVY))
chart.add(String(120, 69, "Achados confirmados", fontName=BOLD_NAME, fontSize=11, fillColor=NAVY))
for i, label in enumerate(("Críticos  0", "Altos  0", "Médios  0", "Baixos  0")):
    chart.add(String(120, 49 - i * 13, label, fontName=FONT_NAME, fontSize=8.5, fillColor=NAVY))
chart.add(Rect(width - 116, 22, 100, 45, fillColor=colors.HexColor("#f0f7f3"), strokeColor=LINE))
chart.add(String(width - 66, 41, "escopo estático", fontName=BOLD_NAME, fontSize=9, textAnchor="middle", fillColor=GREEN))
story += [chart, PageBreak()]

lines = source_lines
i = 0
while i < len(lines):
    line = lines[i].strip()
    if not line or line.startswith("# Relatório"):
        i += 1
        continue
    if line.startswith("|"):
        block = []
        while i < len(lines) and lines[i].strip().startswith("|"):
            block.append(lines[i])
            i += 1
        story.append(make_table(block, width))
        story.append(Spacer(1, 8))
        continue
    if line.startswith("## "):
        story.append(paragraph(line[3:], "AuditH1"))
    elif line.startswith("### "):
        story.append(paragraph(line[4:], "AuditH2"))
    elif line.startswith(("- ", "1. ", "2. ", "3. ", "4. ", "5. ")):
        story.append(paragraph("• " + line.lstrip("-0123456789. "), "AuditBody"))
    else:
        story.append(paragraph(line))
    i += 1

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
