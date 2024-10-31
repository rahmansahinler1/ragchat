from docx import Document
import fitz
import io
import re
import spacy


class ReadingFunctions:
    def __init__(self):
        self.nlp = spacy.load(
            "en_core_web_sm",
            disable=["tagger", "attribute_ruler", "lemmatizer", "ner", "textcat", "custom"]
        )
        self.max_file_size_mb = 50

    def read_file(self, file_bytes: bytes, file_name: str):
        """
        Read and process file content from bytes.
        
        Args:
            file_bytes: Raw file content in bytes
            file_name: Name of the file including extension
            
        Returns:
            Dictionary containing processed file data
        """
        file_size_mb = self._get_file_size(file_bytes=file_bytes)
        file_type = file_name.split(".")[-1].lower()

        if file_size_mb > self.max_file_size_mb:
            raise ValueError(f"File size exceeds {self.max_file_size_mb}MB limit")
        
        try:
            if file_type == "pdf":
                return self._process_pdf(file_bytes=file_bytes)
            elif file_type == "docx":
                return self._process_docx(file_bytes=file_bytes)
            elif file_type in ["txt", "rtf"]:
                return self._process_text_file(file_bytes=file_bytes)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
            
        except Exception as e:
            raise ValueError(f"Error processing {file_name}: {str(e)}")

    def _process_pdf(self, file_bytes: bytes) -> None:
        pdf_data = {
            "sentences": [],
            "is_header": [],
            "file_header": "",
        }
        pdf_file = io.BytesIO(file_bytes)
        with fitz.open(stream=pdf_file, filetype="pdf") as pdf:
            # Process each page
            for page_num in range(len(pdf)):
                page_sentences = []
                page_headers = []
                page = pdf.load_page(page_num)
                blocks = page.get_text("dict")["blocks"]
                text_blocks = [block for block in blocks if block.get("type") == 0]
                # Process each block
                for block in text_blocks:
                    block_sentences, block_headers = self._process_pdf_block(block)
                    page_sentences.extend(block_sentences)
                    page_headers.extend(block_headers)
                pdf_data["sentences"].append(page_sentences)
                pdf_data["is_header"].append(page_headers)
            # Extract first page header
            pdf_data["file_header"] = self._extract_pdf_header(pdf.load_page(0))
        
        return pdf_data

    def _process_pdf_block(self, block: dict) -> None:
        """Process individual PDF block"""
        if "lines" not in block:
            return
        
        block_sentences = []
        block_headers = []

        if len(block["lines"]) >= 1 and len(block["lines"]) < 5:
            # Process potential headers
            for line in block["lines"]:
                for span in line["spans"]:
                    text = span["text"].strip()
                    if self._is_header(span, text):
                        block_sentences.append(text)
                        block_headers.append(True)
                    elif len(text) > 15 and not self._is_separator(text):
                        block_sentences.append(text)
                        block_headers.append(False)
        else:
            # Process regular text
            text = " ".join(span["text"] for line in block["lines"] for span in line["spans"])
            clean_text = self._clean_text(text)
            if len(clean_text) > 15:
                block_sentences.append(clean_text)
                block_headers.append(False)
        
        return block_sentences, block_headers

    def _process_docx(self, file_bytes: bytes):
        docx_data = {
            "sentences": [],
            "is_header": [],
            "file_header": "",
        }
        
        docx_file = io.BytesIO(file_bytes)
        doc = Document(docx_file)
        
        page_sentences = []
        is_header = []
        current_length = 0
        chars_per_page = 2000
        
        for paragraph in doc.paragraphs:
            text = paragraph.text.strip()
            if not text: continue
            bool_is_header = paragraph.style.name.startswith('Heading') or paragraph.style.name.startswith('Title')
            if bool_is_header and not docx_data["file_header"]: docx_data["file_header"] = text
                
            if bool_is_header or len(text) > 15:
                if current_length + len(text) > chars_per_page:
                    docx_data["sentences"].append(page_sentences)
                    docx_data["is_header"].append(is_header)
                    
                    page_sentences = []
                    is_header = []
                    current_length = 0
                
                page_sentences.append(text)
                is_header.append(is_header)
                current_length += len(text)
        
        if page_sentences:
            docx_data["sentences"].append(page_sentences)
            docx_data["is_header"].append(is_header)
        
        return docx_data

    def _process_text_file(self, file_bytes: bytes):
        text_data = {
            "sentences": [],
            "is_header": [],
            "file_header": "",
        }
        text = file_bytes.decode('utf-8', errors='ignore')
        docs = self.nlp(text)
        sentences = [sent.text.replace('\n', ' ').strip() for sent in docs.sents]
        valid_sentences = [s for s in sentences if len(s) > 15]
        text_data["sentences"].append(valid_sentences)
        text_data["is_header"].append(False)
        text_data["file_header"] = None
        
        return text_data

    def _get_file_size(self, file_bytes: bytes) -> None:
        return len(file_bytes) / (1024 * 1024)

    def _clean_text(self, text: str) -> str:
        text = re.sub(r'(\b\w+)\s*\n\s*(\w+\b)', r'\1 \2', text)
        text = re.sub(r'(\w+)-\s+(\w+)', r'\1\2', text)
        text = re.sub(r'[,()]\s*\n\s*(\w+)', r' \1', text)
        text = re.sub(r'(\b\w+)\s*-\s*(\w+\b)', r'\1 \2', text)
        text = re.sub(r'(\w+)\s*[-–]\s*(\w+)', r'\1\2', text)
        text = re.sub(r'(?:[\s!\"#$%&\'()*+,\-.:;<=>?@\[\\\]^_`{|}~]+)(?!\w)', r' ', text)
        text = text.replace('\n', ' ').strip()
        return ' '.join(text.split())

    def _is_header(self, span: dict, text: str) -> bool:
        return (span["size"] > 3 and 
                any(style in span["font"] for style in ["Medi", "Bold", "B"]) and 
                len(text) > 3 and 
                text[0].isalpha() and 
                not self._is_separator(text))

    def _is_separator(self, text: str) -> bool:
        return bool(re.search(r'^[^\w\s]+$|^[_]+$', text))

    def _extract_pdf_header(self, first_page):
        file_header = ""
        blocks = first_page.get_text("dict")["blocks"]
        text_blocks = [block for block in blocks if block.get("type") == 0]

        for block in text_blocks[:3]:  # Look at first 3 blocks only
            if "lines" in block and 1 <= len(block["lines"]) < 4:
                for line in block["lines"]:
                    for span in line["spans"]:
                        if self._is_header(span, span["text"]):
                            file_header += f" {span['text']}"

        return file_header
