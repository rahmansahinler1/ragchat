from pathlib import Path

selected_domain = None
files = None
file_sentence_amount = None
sentences = None
index = None
db_folder_path = Path(__file__).resolve().parent.parent / "db"
memory_file_path = db_folder_path / "memory.json"
