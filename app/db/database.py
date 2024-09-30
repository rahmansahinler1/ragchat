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

    def get_user_info(self, user_email: str):
        query = """
        SELECT DISTINCT user_id, user_name, user_surname, user_type, user_created_at
        FROM user_info
        WHERE user_email = %s
        """
        try:
            self.cursor.execute(query, (
                user_email,
            ))
            data = self.cursor.fetchone()
            return {"user_id": data[0], "user_name": data[1], "user_surname": data[2], "user_type": data[3], "user_created_at": str(data[4])} if data else None
        except DatabaseError as e:
            self.conn.rollback()
            raise e

    def get_file_info(self, user_id: str, domain_id: str):
        query_get_file_info = """
        SELECT DISTINCT file_id, file_name, file_modified_date, file_upload_date
        FROM file_info
        WHERE user_id = %s AND domain_id = %s
        """
        try:
            self.cursor.execute(query_get_file_info, (
                user_id,
                domain_id,
            ))
            data = self.cursor.fetchall()
            return [{"file_id": row[0], "file_name": row[1], "file_modified_date": row[2], "file_upload_date": row[3]} for row in data] if data else None
        except DatabaseError as e:
            self.conn.rollback()
            raise e
    
    def get_domain_info(self, user_id: str, selected_domain_number: int):
        query = """
        SELECT DISTINCT domain_id, domain_name
        FROM domain_info
        WHERE user_id = %s AND domain_number = %s
        """
        try:
            self.cursor.execute(query, (
                user_id,
                selected_domain_number,
            ))
            data = self.cursor.fetchone()
            return {"domain_id": data[0], "domain_name": data[1]} if data else None
        except DatabaseError as e:
            self.conn.rollback()
            raise e
    
    def get_file_content(self, file_ids: list):
        query_get_file_content = """
        SELECT sentence, sentence_order, page_number, embedding
        FROM file_content
        WHERE file_id IN %s
        """
        try:
            self.cursor.execute(query_get_file_content, (
                tuple(file_ids, ), 
            ))
            data = self.cursor.fetchall()
            return data
        except DatabaseError as e:
            self.conn.rollback()
            raise e

    def insert_file_info(self, file_info, domain_id):
        query_insert_file_info = """
        INSERT INTO file_info (user_id, file_id, domain_id, file_name, file_modified_date)
        VALUES (%s, %s, %s, %s, %s)
        """
        try:
            self.cursor.execute(query_insert_file_info, (
                file_info["user_id"],
                file_info["file_id"],
                domain_id,
                file_info["file_name"][:100],
                file_info["file_modified_date"][:20],
            ))
        except DatabaseError as e:
            self.conn.rollback()
            raise e

    def insert_file_content(self, file_id, file_sentences, file_embeddings):
        query_insert_file_content = """
        INSERT INTO file_content (file_id, page_number, sentence, sentence_order, embedding)
        VALUES %s
        """
        try:
            for page_number, (page_sentences, page_embeddings) in enumerate(zip(file_sentences, file_embeddings)):                                                                                
                inserted_data = [
                (file_id, page_number + 1, sentence, sentence_order + 1, psycopg2.Binary(embedding.tobytes()) if embedding is not None else None)
                for sentence_order, (sentence, embedding) in enumerate(zip(page_sentences, page_embeddings))
                ]
                extras.execute_values(self.cursor, query_insert_file_content, inserted_data)
        except DatabaseError as e:
            self.conn.rollback()
            raise e
    
    def clear_file_info(self, user_id: str, file_ids: list):
        query = """
        DELETE FROM file_info
        WHERE user_id = %s AND file_id IN %s
        """
        try:
            self.cursor.execute(query, (user_id, tuple(file_ids, )))
            return self.cursor.rowcount
        except DatabaseError as e:
            self.conn.rollback()
            raise e
    
    def clear_file_content(self, user_id: str, files_to_remove: list):
        get_file_ids_query = """
        SELECT DISTINCT file_id
        FROM file_info
        WHERE user_id = %s AND file_name IN %s
        """

        clear_content_query = """
        DELETE FROM file_content
        WHERE file_id IN %s
        """
        try:
            self.cursor.execute(get_file_ids_query, (user_id, tuple(files_to_remove, )))
            file_ids = [row[0] for row in self.cursor.fetchall()]

            if file_ids:
                self.cursor.execute(clear_content_query, (tuple(file_ids), ))
                total_cleared = self.cursor.rowcount
                return total_cleared, file_ids
            else:
                return 0
        except DatabaseError as e:
            self.conn.rollback()
            raise e

if __name__ == "__main__":
    with Database() as db:
        db.reset_database()
        db.initialize_tables()
