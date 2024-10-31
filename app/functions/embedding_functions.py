import numpy as np
from openai import OpenAI
from dotenv import load_dotenv
from typing import List


class EmbeddingFunctions:
    def __init__(self):
        load_dotenv()
        self.client = OpenAI()

    def create_embeddings_from_nested_sentences(
        self,
        nested_sentences: List[List[str]],
    ) -> List[np.ndarray]:
        nested_embeddings = []
        for sentences in nested_sentences:
            if sentences:
                nested_embeddings.append(self.create_embeddings_from_sentences(sentences=sentences))
            else:
                nested_embeddings.append(np.array([]))
        return nested_embeddings

    def create_embedding_from_sentence(
            self,
            sentence: list
    ) -> np.ndarray:
        query_embedding = self.client.embeddings.create(model="text-embedding-ada-002", input=sentence)
        return np.array(query_embedding.data[0].embedding, dtype=np.float16).reshape(1, -1)
    
    def create_embeddings_from_sentences(
        self,
        sentences: List[str],
    ) -> np.ndarray:
        
        embeddings = self.client.embeddings.create(model="text-embedding-ada-002", input=sentences)
        return np.array([x.embedding for x in embeddings.data], dtype=np.float16)
