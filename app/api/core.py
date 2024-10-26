from typing import List
import numpy as np
import bcrypt

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
            index_header
    ):
        content_amount = len(domain_content)
        boost = np.ones(content_amount)
        query_vector = self.ef.create_embedding_from_sentence(sentence=user_query)
        # Extract headers TODO: delete this part and try to write it without any domain content loading
        header_indexes = [index for index in range(content_amount) if domain_content[index][1]]
        D_header, I_header = index_header.search(query_vector, 10)
        filtered_header_indexes = sorted([header_index for index, header_index in enumerate(I_header[0]) if D_header[0][index] < 0.50])
        for filtered_index in filtered_header_indexes:
            try:
                start = header_indexes[filtered_index] + 1
                end = header_indexes[filtered_index + 1]
                boost[start:end] *= 0.9
            except IndexError:
                continue
        D_user, I_user = index.search(query_vector, content_amount)
        boosted_distances = D_user[0] * boost
        sorted_distance = [i for i, _ in sorted(enumerate(boosted_distances), key=lambda x: x[1], reverse=False)]
        sorted_sentences = I_user[0][sorted_distance[:10]]
        widen_sentences = self._wide_sentences(window_size=1, convergence_vector=sorted_sentences, domain_content=domain_content)
        context = self._create_dynamic_context(sentences=widen_sentences)
        resources = self._extract_resources(convergence_vector=I_user[0], domain_content=domain_content)
        response = self.cf.response_generation(query=user_query, context=context)
        return widen_sentences, response, resources

    def _generate_additional_queries(self, query):
        return self.cf.query_generation(query=query)

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
            resources["file_ids"].append(domain_content[index][4])
            resources["page_numbers"].append(domain_content[index][3])
        return resources

    def _create_dynamic_context(self, sentences):
        context = ""
        for i, sentence in enumerate(sentences, 1):
            context += f"Context{i}: {sentence}\n"
        return context
    
    def extract_header_embeddings(
            self,
            domain_content: List[tuple]
    ):
        header_indexes = [index for index in range(len(domain_content)) if domain_content[index][1]]
        headers = [domain_content[header_index][0] for header_index in header_indexes]
        return self.ef.create_embeddings_from_sentences(sentences=headers)
