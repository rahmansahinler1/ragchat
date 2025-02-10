from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter


class Exporter:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.doc = SimpleDocTemplate(
            "export.pdf",
            pagesize=letter,
            leftMargin=12,
            rightMargin=12,
            topMargin=12,
            bottomMargin=6,
        )

    def export_pdf(self, data):
        elements = []

        elements.append(Paragraph("Exported Response", self.styles["Title"]))
        elements.append(Spacer(1, 12))

        for line in data.split("\n"):
            elements.append(Paragraph(line, self.styles["Normal"]))
            elements.append(Spacer(1, 12))

        self.doc.build(elements)
