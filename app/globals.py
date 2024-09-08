from pathlib import Path

files = None
file_sentence_amount = None
sentences = None
index = None
db_folder_path = Path(__file__).resolve().parent.parent / "db"
memory_file_path = db_folder_path / "memory.json"
domain_folder_path = db_folder_path / "domains" / "domain"
index_path = db_folder_path  / "indexes" /  "domain.pickle"
