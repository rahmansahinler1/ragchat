from database import DatabaseFunctions
import uuid
import pickle
from pathlib import Path
import time 
db = DatabaseFunctions()

namespace= uuid.NAMESPACE_DNS



path = Path("/Users/ozgur.sahin/Documents/ragchat/domain1.pickle")

with open(path,'rb') as file:
        pickle_test = pickle.load(file)

sentences = pickle_test["sentences"]
embeddings = pickle_test["embeddings"].tolist()
file_name = pickle_test["file_path"]
file_date = pickle_test["date"]

domain_uuid_string = "domain1"
file_uuid_string = "domain1"+str(file_name)

domain_uuid = uuid.uuid5(namespace, domain_uuid_string)
file_uuid = uuid.uuid5(namespace, file_uuid_string)

domain_uuids = [domain_uuid]*len(sentences)
file_uuids = [file_uuid]*len(sentences)
domain_name = ["domain1"]*len(sentences)
sentence_order_number = []
for i in range(1,len(sentences)):
        sentence_order_number.append(i)

data_to_insert = list(zip(file_uuids, domain_uuids, sentences, sentence_order_number, embeddings))
data_to_insert1 = list(zip(file_uuids, domain_uuids, domain_name, file_name, file_date))

#db.execute_create_table_query()
#db.insert_fileinfo_query(data=data_to_insert1)
#start = time.time()
#db.insert_domaincontent_query(data=data_to_insert)
#db.execute_delete_file_sentences_query("2dd288c5-034a-5947-a6c7-b1f1a870fb66",1,25)
#db.insert_fileinfo_query(data=data_to_insert1)
#rows = db.execute_file_info_read_query()
#rows = db.execute_domain_content_read_query(domain_uuid="93904808-d6e1-55d7-b4e7-be135314f232")
#print(rows[0])
#end = time.time()
#db.execute_file_info_delete_query(file_uuid="2dd288c5-034a-5947-a6c7-b1f1a870fb66")
#db.execute_file_info_delete_query(file_uuid='eba87c17-0f2f-44ae-8ae2-998b4100326e')

#print(end-start)
db.close_cursor()