from pathlib import Path

file_selections = []
file_selection_identifiers = []
sentences = {}
index = {}
db_folder_path = Path(__file__).resolve().parent.parent / "db"
memory_file_path = db_folder_path / "memory.json"
domain_folder_path = db_folder_path / "domains" / "domain"
index_path = db_folder_path  / "indexes" /  "domain.pickle"
