import numpy as np
from openai import OpenAI
from dotenv import load_dotenv
from typing import List


class EmbeddingFunctions:
    def __init__(self):
        load_dotenv()
        self.client = OpenAI()

    def create_embeddings_from_sentences(
        self,
        file_sentences: List[List[str]],
    ) -> List[np.ndarray]:
        file_embeddings = []
        for page_sentences in file_sentences:
            if page_sentences:
                page_embeddings = self.client.embeddings.create(model="text-embedding-ada-002", input=page_sentences)
                file_embeddings.append(np.array([x.embedding for x in page_embeddings.data], dtype=np.float32))
            else:
                file_embeddings.append(np.array([]))
        return file_embeddings

    def create_embedding_from_query(self, query):
        query_embedding = self.client.embeddings.create(model="text-embedding-ada-002", input=query)
        return np.array(query_embedding.data[0].embedding, float).reshape(1, -1)
