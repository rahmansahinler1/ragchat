from psycopg2 import extras
from psycopg2 import DatabaseError
from pathlib import Path
import psycopg2
import logging
import numpy as np

from .config import GenerateConfig

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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
        with sql_path.open("r") as file:
            query = file.read()
        try:
            self.cursor.execute(query)
            self.conn.commit()
        except DatabaseError as e:
            self.conn.rollback()
            raise e
    
    def reset_database(self):
        sql_path = Path(__file__).resolve().parent / "sql" / "database_reset.sql"
        with sql_path.open("r") as file:
            query = file.read()
        try:
            self.cursor.execute(query)
            self.conn.commit()
        except DatabaseError as e:
            self.conn.rollback()
            raise e
    
    def _bytes_to_embeddings(self, byte_array):
        return np.frombuffer(byte_array.tobytes(), dtype=np.float16).reshape(byte_array.shape[0], -1)

    def get_user_info_w_email(self, user_email: str):
        query_get_user_info = """
        SELECT DISTINCT user_id, user_name, user_surname, user_password, user_type, is_active, user_created_at
        FROM user_info
        WHERE user_email = %s
        """
        try:
            self.cursor.execute(
                query_get_user_info,
                (
                user_email,
                )
            )
            data = self.cursor.fetchone()
            return {"user_id": data[0], "user_name": data[1], "user_surname": data[2], "user_password": data[3], "user_type": data[4], "is_active": data[5], "user_created_at": str(data[6])} if data else None
        except DatabaseError as e:
            self.conn.rollback()
            raise e
    
    def get_user_info_w_id(self, user_id: str):
        query_get_user_info = """
        SELECT DISTINCT user_name, user_surname, user_email, user_type, user_created_at
        FROM user_info
        WHERE user_id = %s
        """
        try:
            self.cursor.execute(
                query_get_user_info,
                (
                user_id,
                )
            )
            data = self.cursor.fetchone()
            return {"user_name": data[0], "user_surname": data[1], "user_email": data[2], "user_type": data[3], "user_created_at": str(data[4])} if data else None
        except DatabaseError as e:
            self.conn.rollback()
            raise e

    def get_file_info_with_domain(self, user_id: str, domain_id: str):
        query_get_file_info = """
        SELECT DISTINCT file_id, file_name, file_modified_date, file_upload_date
        FROM file_info
        WHERE user_id = %s AND domain_id = %s
        """
        try:
            self.cursor.execute(
                query_get_file_info,
                (
                user_id,
                domain_id,
                )
            )
            data = self.cursor.fetchall()
            return [{"file_id": row[0], "file_name": row[1], "file_modified_date": row[2], "file_upload_date": row[3]} for row in data] if data else None
        except DatabaseError as e:
            self.conn.rollback()
            raise e
    
    def get_file_name_with_id(self, file_id: str):
        query_get_file_name = """
        SELECT file_name
        FROM file_info
        WHERE file_id = %s
        """
        try:
            self.cursor.execute(
                query_get_file_name,
                (
                file_id,
                )
            )
            data = self.cursor.fetchone()
            return data[0]
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
            self.cursor.execute(
                query,
                (
                user_id,
                selected_domain_number,
                )
            )
            data = self.cursor.fetchone()
            return {"domain_id": data[0], "domain_name": data[1]} if data else None
        except DatabaseError as e:
            self.conn.rollback()
            raise e
    
    def get_file_content(self, file_ids: list):
        query_get_content = """
        SELECT sentence, is_header, sentence_order, page_number, file_id
        FROM file_content
        WHERE file_id IN %s
        """
        query_get_embeddings = """
        SELECT array_agg(embedding) AS embeddings
        FROM file_content
        WHERE file_id IN %s
        """
        try:
            self.cursor.execute(
                query_get_content,
                (
                    tuple(file_ids),
                )
            )
            content = self.cursor.fetchall()
            self.cursor.execute(
                query_get_embeddings,
                (
                    tuple(file_ids),
                )
            )
            byte_embeddings = self.cursor.fetchone()
            if content and byte_embeddings and byte_embeddings[0]:
                embeddings = self._bytes_to_embeddings(np.array(byte_embeddings[0]))
                return content, embeddings
            else:
                return None
        except DatabaseError as e:
            self.conn.rollback()
            print(f"Database error occurred: {e}")
            return None, None
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return None, None
    
    def get_session_info(self, session_id: str):
        query_get_session = """
        SELECT user_id, created_at
        FROM session_info
        WHERE session_id = %s
        """
        self.cursor.execute(
                query_get_session,
                (
                    session_id,
                )
        )
        data = self.cursor.fetchone()
        return {"user_id": data[0], "created_at": data[1]} if data else None

    def insert_user_info(self, user_id: str, user_name: str, user_surname: str, user_password: str, user_email: str, user_type:str , is_active: bool):
        query_insert_user_info = """
        INSERT INTO user_info (user_id, user_name, user_surname, user_password, user_email, user_type, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        try:
            self.cursor.execute(
                query_insert_user_info,
                (
                    user_id,
                    user_name,
                    user_surname,
                    user_password,
                    user_email,
                    user_type,
                    is_active,
                )
            )
        except DatabaseError as e:
            self.conn.rollback()
            raise e

    def insert_domain_info(self, user_id: str, domain_id: str, domain_name: str, domain_number: int):
        query_insert_domain_info = """
        INSERT INTO domain_info (user_id, domain_id, domain_name, domain_number)
        VALUES (%s, %s, %s, %s)
        """
        try:
            self.cursor.execute(
                query_insert_domain_info,
                (
                    user_id,
                    domain_id,
                    domain_name,
                    domain_number,
                )
            )
        except DatabaseError as e:
            self.conn.rollback()
            raise e      

    def insert_file_info(self, file_info: dict, domain_id: str):
        query_insert_file_info = """
        INSERT INTO file_info (user_id, file_id, domain_id, file_name, file_modified_date)
        VALUES (%s, %s, %s, %s, %s)
        """
        try:
            self.cursor.execute(
                query_insert_file_info,
                (
                    file_info["user_id"],
                    file_info["file_id"],
                    domain_id,
                    file_info["file_name"][:100],
                    file_info["file_modified_date"][:20],
                )
            )
        except DatabaseError as e:
            self.conn.rollback()
            raise e

    def insert_file_content(self, file_id: str, file_sentences: list, file_headers:list, file_embeddings: np.ndarray):
        query_insert_file_content = """
        INSERT INTO file_content (file_id, page_number, sentence, is_header, sentence_order, embedding)
        VALUES %s
        """
        try:
            file_data = []
            for page_number, (page_sentences, page_headers, page_embeddings) in enumerate(zip(file_sentences, file_headers, file_embeddings)):
                if not isinstance(page_embeddings, np.ndarray):
                    logger.warning(f"Page {page_number} embeddings are not a numpy array. Skipping.")
                    continue

                if not page_embeddings.size or not len(page_sentences):
                    logger.warning(f"Page {page_number} embeddings or sentences are empty. Skipping")
                    continue

                if page_embeddings.shape[1] != 1536:
                    logger.warning(f"Page {page_number} embeddings have unexpected shape: {page_embeddings.shape}. Expected (n, 1536). Skipping.")
                    continue

                page_data = []
                for sentence_order, (sentence, is_header, embedding) in enumerate(zip(page_sentences, page_headers, page_embeddings)):
                    page_data.append(
                        (
                            file_id, 
                            page_number + 1, 
                            sentence,
                            is_header,
                            sentence_order + 1, 
                            psycopg2.Binary(embedding.tobytes())
                        )
                    )

                file_data.extend(page_data)
            if file_data:
                extras.execute_values(self.cursor, query_insert_file_content, file_data)
                logger.info(f"Inserted {len(file_data)} rows for file {file_id}")
            else:
                logger.warning(f"No data to insert for file {file_id}")
        except DatabaseError as e:
            self.conn.rollback()
            logger.error(f"Database error while inserting file content: {str(e)}")
            raise e
        except Exception as e:
            self.conn.rollback()
            logger.error(f"Unexpected error while inserting file content: {str(e)}")
            raise e
    
    def insert_session_info(self, user_id: str, session_id: str):
        query = """
        INSERT INTO session_info (user_id, session_id, created_at)
        VALUES (%s, %s, NOW())
        """
        try:
            self.cursor.execute(
                query,
                (
                    user_id,
                    session_id
                )
            )
        except Exception as e:
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
