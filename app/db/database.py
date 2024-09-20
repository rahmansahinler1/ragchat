import psycopg2
import json
import logging
from psycopg2 import DatabaseError

from .config import GenerateConfig
from .scripts.db_functions import DatabaseFunctions


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
    
    def insert_file_info(self, file_info):
        query = """
        INSERT INTO domain_info (domain_name, file_name, file_date, file_sentences)
        VALUES (%s, %s, %s, %s)
        """
        self.execute(
            query=query,
            params=(
            file_info.get('domain', 'default_domain'),
            file_info['file_name'],
            file_info['date'],
            json.dumps(file_info['file_sentences'])
            )
        )
        logging.info(f"File info inserted successfully: {file_info['file_name']}")

if __name__ == "__main__":
    with Database() as db:
        dbf = DatabaseFunctions(db)
        dbf.initialize_tables()