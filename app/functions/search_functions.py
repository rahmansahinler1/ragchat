import numpy as np
from rank_bm25 import BM25Okapi


class SearchFunctions:
    def __init__(self):
        pass

    def bm25_search(self, user_query, sentences):
        # Conduct bm25 search 
        bm25 = BM25Okapi(sentences) 
        scores = bm25.get_scores(user_query) 
        max_score,min_score = max(scores),min(scores)
        
        # Normalize scores between -1 - 1
        if max_score > min_score:
            normalized_scores = [2 * (score - min_score) / (max_score - min_score) -1 for score in scores]
        else:
            normalized_scores = [0.0] * len(scores)

        return np.array(normalized_scores)