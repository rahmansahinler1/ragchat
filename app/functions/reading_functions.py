from PyPDF2 import PdfReader
import spacy
import io
import re


class ReadingFunctions:
    def __init__(self):
        self.nlp = spacy.load(
            "en_core_web_sm",
            disable=[ "tagger", "attribute_ruler", "lemmatizer", "ner", "textcat", "custom"]
        )

    def read_file(self, file_bytes, file_name):
        sentences = []
        try:
            file_type = file_name.split(".")[-1]
            if file_type == "pdf":
                pdf_file = io.BytesIO(file_bytes)
                pdf_reader = PdfReader(pdf_file)
                for _, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    valid_sentences = self._process_text(page_text)
                    sentences.append(valid_sentences)
                return sentences
        except Exception as e:
            raise ValueError(f"Error reading file!. Error: {str(e)}")

    def _process_text(self, text):
        docs = self.nlp(text)
        sentences = [sent.text.replace("\n", " ").strip() for sent in docs.sents]
        return [sentence for sentence in sentences if len(sentence) > 15]

    def _validate_file_size(self, file_bytes):
        size_mb = len(file_bytes) / (1024 * 1024)
        if size_mb > self.max_file_size:
            raise ValueError(f"File size exceeds {self.max_file_size}MB limit")
    
    def _clean_text(self, text):
        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep sentence structure
        text = re.sub(r'[^\w\s\.!?]', '', text)
        # Fix common OCR errors
        text = text.replace('|', 'I')
        text = text.replace('0', 'O')
        return text.strip()
    
    def _chunk_text(self, text, chunk_size=1000):
        chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
        return chunks
        