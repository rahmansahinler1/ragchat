from typing import Dict, List
import numpy as np
import json
import bcrypt
import uuid

from ..functions.reading_functions import ReadingFunctions
from ..functions.embedding_functions import EmbeddingFunctions
from ..functions.indexing_functions import IndexingFunctions
from ..functions.chatbot_functions import ChatbotFunctions


class Authenticator:
    def __init__(self):
        pass

    def verify_password(
            self,
            plain_password: str,
            hashed_password: str
    ) -> bool:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

    def hash_password(
            self,
            password: str
    ) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

class Processor:
    def __init__(
            self,
    ):
        self.ef = EmbeddingFunctions()
        self.rf = ReadingFunctions()
        self.indf = IndexingFunctions()
        self.cf = ChatbotFunctions()
    
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
