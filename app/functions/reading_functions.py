from docx import Document
from PyPDF2 import PdfReader
import spacy
import io


class ReadingFunctions:
    def __init__(self):
        self.nlp = spacy.load(
            "en_core_web_sm",
            disable=[ "tagger", "attribute_ruler", "lemmatizer", "ner", "textcat", "custom"]
        )

    def read_file(self, file_bytes, file_type):
        sentences = {}
        try:
            if file_type == 'pdf':
                pdf_file = io.BytesIO(file_bytes)
                pdf_reader = PdfReader(pdf_file)
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    valid_sentences = self._process_text(page_text)
                    sentences[page_num + 1] = valid_sentences
                return sentences
        except Exception as e:
            raise ValueError(f"Error reading file!. Error: {str(e)}")

    def _process_text(self, text):
        docs = self.nlp(text)
        sentences = [sent.text.replace('\n', ' ').strip() for sent in docs.sents]
        return [sentence for sentence in sentences if len(sentence) > 15]
        