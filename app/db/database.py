import psycopg2
from psycopg2 import extras
from psycopg2 import DatabaseError
from pathlib import Path

from .config import GenerateConfig


class Database:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance.db_config = GenerateConfig.config()
        return cls._instance

    def __enter__(self):
        self.conn = psycopg2.connect(**self.db_config)
        self.cursor = self.conn.cursor()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.cursor:
            self.cursor.close()
        if self.conn:
            if exc_type is None:
                self.conn.commit()
            else:
                self.conn.rollback()
            self.conn.close()
    
    def execute(self, query, params=None):
        self.cursor.execute(query, params)
    
    def initialize_tables(self):
        sql_path = Path(__file__).resolve().parent / "sql" / "table_initialize.sql"
        with sql_path.open('r') as file:
            query = file.read()
        try:
            self.cursor.execute(query)
            self.conn.commit()
        except DatabaseError as e:
            self.conn.rollback()
            raise e
    
    def reset_database(self):
        sql_path = Path(__file__).resolve().parent / "sql" / "database_reset.sql"
        with sql_path.open('r') as file:
            query = file.read()
        try:
            self.cursor.execute(query)
            self.conn.commit()
        except DatabaseError as e:
            self.conn.rollback()
            raise e

    def add_user(self):
        # TODO: add user function
        pass

    def insert_file_info(self, file_info):
        query = """
        INSERT INTO file_info (file_id, user_id, file_domain, file_name, file_type, file_modified_date)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        try:
            self.execute(query, (
                file_info["file_id"],
                file_info["user_id"],
                file_info["file_domain"][:100],
                file_info["file_name"][:255],
                file_info["file_type"][:50],
                file_info["file_modified_date"]
            ))
        except DatabaseError as e:
            self.conn.rollback()
            raise e

    def insert_file_content(self, file_id, file_sentences, file_embeddings):
        query = """
        INSERT INTO file_content (file_id, page_number, sentence, sentence_order, embedding)
        VALUES %s
        """
        try:
            for page_number, (page_sentences, page_embeddings) in enumerate(zip(file_sentences, file_embeddings)):                                                                                
                inserted_data = [
                (file_id, page_number + 1, sentence, sentence_order + 1, psycopg2.Binary(embedding.tobytes()) if embedding is not None else None)
                for sentence_order, (sentence, embedding) in enumerate(zip(page_sentences, page_embeddings))
                ]
                extras.execute_values(self.cursor, query, inserted_data)
        except DatabaseError as e:
            self.conn.rollback()
            raise e

if __name__ == "__main__":
    with Database() as db:
        db.reset_database()
        db.initialize_tables()
