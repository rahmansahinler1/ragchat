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

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )

    def hash_password(self, password: str) -> str:
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

    def create_index(self, embeddings: np.ndarray, index_type: str = "flat"):
        if index_type == "flat":
            index = self.indf.create_flat_index(embeddings=embeddings)
        return index

    def search_index(
        self,
        user_query: str,
        domain_content: dict,
        boost_info: dict,
        index,
        index_header,
    ):
        queries = self.query_preprocessing(user_query=user_query)
        if not queries:
            return None, None, None

        query_embeddings = self.ef.create_embeddings_from_sentences(sentences=queries)
        boost_array = self._create_boost_array(
            boost_info=boost_info,
            sentence_amount=index.ntotal,
            query_vector=query_embeddings[0],
            index_header=index_header,
        )

        # Get search distances with occurrences
        dict_resource = {}
        for query_embedding in query_embeddings:
            D, I = index.search(query_embedding.reshape(1, -1), 10)
            for i, match_index in enumerate(I[0]):
                if match_index in dict_resource:
                    dict_resource[match_index].append(D[0][i])
                else:
                    dict_resource[match_index] = [D[0][i]]

        # Get average occurrences
        dict_resource = self._avg_resources(dict_resource)
        for key in dict_resource:
            dict_resource[key] *= boost_array[key]
        sorted_dict = dict(sorted(dict_resource.items(), key=lambda item: item[1]))
        indexes = np.array(list(sorted_dict.keys()))
        sorted_sentence_indexes = indexes[:5]

        # Context building
        widen_sentences = []
        for i, sentence_index in enumerate(sorted_sentence_indexes):
            if i > 3:
                widen_sentences.append(
                    self._wide_sentences(
                        window_size=1,
                        sentence_index=sentence_index,
                        domain_content=domain_content,
                    )
                )
            elif i > 1:
                widen_sentences.append(
                    self._wide_sentences(
                        window_size=2,
                        sentence_index=sentence_index,
                        domain_content=domain_content,
                    )
                )
            else:
                widen_sentences.append(
                    self._wide_sentences(
                        window_size=3,
                        sentence_index=sentence_index,
                        domain_content=domain_content,
                    )
                )

        context = self._create_dynamic_context(sentences=widen_sentences)
        response = self.cf.response_generation(query=user_query, context=context)
        answer = self._split_response(raw_answer=response)
        resources = self._extract_resources(
            sentence_indexes=sorted_sentence_indexes, domain_content=domain_content
        )

        return answer, resources, widen_sentences

    def query_preprocessing(self, user_query):
        generated_queries = self.cf.query_generation(query=user_query).split("\n")

        if len(generated_queries) == 6:
            return generated_queries
        return None

    def _create_boost_array(
        self,
        boost_info: dict,
        sentence_amount: int,
        query_vector: np.ndarray,
        index_header,
    ):
        boost_array = np.ones(sentence_amount)
        D, I = index_header.search(query_vector.reshape(1, -1), 10)
        filtered_header_indexes = [
            header_index
            for index, header_index in enumerate(I[0])
            if D[0][index] < 0.40
        ]
        if not filtered_header_indexes:
            return boost_array
        else:
            for i, filtered_index in enumerate(filtered_header_indexes):
                try:
                    start = boost_info["header_indexes"][filtered_index] + 1
                    end = boost_info["header_indexes"][filtered_index + 1]
                    if i > 2:
                        boost_array[start:end] *= 0.9
                    elif i > 0:
                        boost_array[start:end] *= 0.8
                    else:
                        boost_array[start:end] *= 0.7
                except IndexError as e:
                    print(f"List is out of range {e}")
                    continue
            return boost_array

    def _wide_sentences(
        self, window_size: int, sentence_index: int, domain_content: List[tuple]
    ):
        widen_sentences = ""
        start = max(0, sentence_index - window_size)
        end = min(len(domain_content) - 1, sentence_index + window_size)
        try:
            for index in range(start, end):
                widen_sentences += f"{domain_content[index][0]} "
            return widen_sentences
        except:  # noqa: E722
            return ""

    def _avg_resources(self, resources_dict):
        for key, value in resources_dict.items():
            value_mean = sum(value) / len(value)
            value_coefficient = value_mean - len(value) * 0.0025
            resources_dict[key] = value_coefficient
        return resources_dict

    def _extract_resources(self, sentence_indexes: list, domain_content: List[tuple]):
        resources = {"file_ids": [], "page_numbers": []}
        for index in sentence_indexes:
            resources["file_ids"].append(domain_content[index][3])
            resources["page_numbers"].append(domain_content[index][2])
        return resources

    def _create_dynamic_context(self, sentences):
        context = ""
        for i, sentence in enumerate(sentences):
            context += f"{i + 1}: {sentence}\n"
        return context

    def extract_boost_info(self, domain_content: List[tuple], embeddings: np.ndarray):
        header_indexes = [
            index for index in range(len(domain_content)) if domain_content[index][1]
        ]
        headers = [domain_content[header_index][0] for header_index in header_indexes]
        header_embeddings = embeddings[header_indexes]
        return {
            "header_indexes": header_indexes,
            "headers": headers,
            "header_embeddings": header_embeddings,
        }

    def _split_response(self, raw_answer: str):
        try:
            parts = raw_answer.split("E: ")
            info = parts[0].replace("I: ", "").strip()
            explanation = parts[1].strip() if len(parts) > 1 else ""

            return {"information": info, "explanation": explanation}
        except:  # noqa: E722
            return {"information": raw_answer, "explanation": ""}
