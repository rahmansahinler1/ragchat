from database import DatabaseFunctions
from uuid import UUID,uuid4
import pickle
from pathlib import Path
import time 
db = DatabaseFunctions()
uuid = uuid4()

#db.execute_extension_query()
path = Path("/Users/ozgur.sahin/Documents/ragchat/domain1.pickle")

with open(path,'rb') as file:
        pickle_test = pickle.load(file)

sentences = pickle_test["sentences"]
embeddings = pickle_test["embeddings"].tolist()
pdf_name = pickle_test["file_path"]
pdf_date = pickle_test["date"]
page_sentences = pickle_test["file_sentence_amount"]

domain_uuid = [uuid]*len(sentences)
domain = ["domain1"]*len(sentences)

data_to_insert = list(zip(domain_uuid, domain, sentences, embeddings))
data_to_insert1 = list(zip(domain_uuid, domain, pdf_name, pdf_date, page_sentences))

#batch_size = 200
#batches = [data_to_insert1[i:i+batch_size] for i in range(0,len(data_to_insert1),batch_size)]
start = time.time()
#for batch in batches:
#db.execute_insert_domaininfo_query(data=data_to_insert1) 
db.execute_delete_sentences_query(2,3)
#rows = db.execute_read_query()


#print(rows[0][2])
#db.execute_delete_query()
end = time.time()
db.close_cursor()
print(end-start)