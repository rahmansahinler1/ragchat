from typing import Dict, List
from pathlib import Path
from datetime import datetime
import numpy as np

import faiss
import json
import re
import textwrap

from ..functions.reading_functions import ReadingFunctions
from ..functions.embedding_functions import EmbeddingFunctions
from ..functions.indexing_functions import IndexingFunctions
from ..functions.chatbot_functions import ChatbotFunctions
from .. import globals


class FileDetector:
    def __init__(
            self,
            domain_folder_path: Path,
            memory_file_path: Path
        ):
        self.domain_folder_path = domain_folder_path
        self.memory_file_path = memory_file_path
    
    def check_changes(self):
        changes = {
            "insert": [],
            "delete": [],
            "update": []
        }
        # Load memory db information
        with open(self.memory_file_path, "r") as file:
            memory_data = json.load(file)
        
        # Load current db information
        current_file_data = []
        for file in self.domain_folder_path.rglob("*"):
            file_data = {}
            file_name = file.parts[-1]
            domain = file.parts[-2]
            
            if file_name.split(".")[-1] not in ["pdf", "docx", "txt", "rtf"]:
                continue
            
            date_modified = datetime.fromtimestamp(file.stat().st_mtime)
            date_modified_structured = f"{date_modified.month}/{date_modified.day}/{date_modified.year} {date_modified.hour}:{date_modified.minute}"
            file_data["file_path"] = f"db/domains/{domain}/{file_name}"
            file_data["date_modified"] = date_modified_structured
            current_file_data.append(file_data)

        # Check for insertion and updates
        memory_file_paths = [item["file_path"] for item in memory_data]
        for data in current_file_data:
            if data in memory_data:
                continue
            elif data["file_path"] in memory_file_paths:
                changes["update"].append({"file_path": data["file_path"], "date_modified": data["date_modified"]})
                memory_index = memory_file_paths.index(data["file_path"])
                memory_data[memory_index]["date_modified"] = data["date_modified"]
            else:
                changes["insert"].append({"file_path": data["file_path"], "date_modified": data["date_modified"]})
                memory_data.append(data)
        
        # Check for deletion
        for i, data in enumerate(memory_data):
            if data not in current_file_data:
                changes["delete"].append({"file_path": data["file_path"], "date_modified": data["date_modified"]})
                memory_data.pop(i)

        return changes, memory_data

class FileProcessor:
    def __init__(
            self,
            change_dict: Dict = {}
    ):
        self.ef = EmbeddingFunctions()
        self.rf = ReadingFunctions()
        self.indf = IndexingFunctions()
        self.cf = ChatbotFunctions()
        self.change_dict = change_dict
    
    def create_index(
            self,
            embeddings: np.ndarray,
            index_type: str = "flat"
        ):
        if index_type == "flat":
            index = self.indf.create_flat_index(embeddings=embeddings)
        return index
    
    def search_index(
            self,
            user_query: str,
            domain_content: List[tuple],
            index,
    ):
        query_vector = self.ef.create_embedding_from_query(query=user_query)
        D, I = index.search(query_vector, 5)
        widen_sentences = self._wide_sentences(window_size=1, convergence_vector=I[0], domain_content=domain_content)
        context = f"""Context1: {widen_sentences[0]}
        Context2: {widen_sentences[1]}
        Context3: {widen_sentences[2]}
        Context4: {widen_sentences[3]}
        Context5: {widen_sentences[4]}
        """
        resources = self._extract_resources(convergence_vector=I[0], domain_content=domain_content)
        response = self.cf.response_generation(query=user_query, context=context)
        return widen_sentences, response, resources

    def _wide_sentences(
            self,
            window_size: int,
            convergence_vector: np.ndarray,
            domain_content: List[tuple]
    ):  
        widen_sentences = []
        for index in convergence_vector:
            start = max(0, index - window_size)
            end = min(len(domain_content) - 1, index + window_size)
            widen_sentences.append(f"{domain_content[start][0]} {domain_content[index][0]} {domain_content[end][0]}")
        return widen_sentences
    
    def _extract_resources(
            self,
            convergence_vector: np.ndarray,
            domain_content: List[tuple]
    ):
        resources = {
            "file_ids": [],
            "page_numbers": []
        }
        for index in convergence_vector:
            resources["file_ids"].append(domain_content[index][3])
            resources["page_numbers"].append(domain_content[index][2])
        return resources
