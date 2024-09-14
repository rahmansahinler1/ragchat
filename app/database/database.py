import psycopg2
import psycopg2.extras
from psycopg2 import DatabaseError
from config import config
from uuid import UUID
from pathlib import Path


class DatabaseFunctions:
    def __init__(self):
        db_config = config() # Call config
        self.conn = psycopg2.connect(**db_config) # Initialize connection with db
        self.cursor = self.conn.cursor() # Initialize cursor
    
    # Create DB tables
    def execute_create_table_query(self):
        path = Path("app/database/create_table.sql")
        with path.open('r') as file:
            query = file.read()
        try:
            self.cursor.execute(query)
            self.conn.commit()
        except DatabaseError as e:
            self.conn.rollback()
            print(f"Error while executing {e}")
            raise e
    
    # Insert to domain_content table
    def insert_domaincontent_query(self,data:list):
        psycopg2.extras.register_uuid()
        path = Path("app/database/insert_domain_content.sql")
        with path.open('r') as file:
            query = file.read()
        try:
            self.cursor.executemany(query,data)
            self.conn.commit()
        except DatabaseError as e:
            self.conn.rollback()
            print(f"Error while executing {e}")
            raise e
        
    # Insert to file_info table    
    def insert_fileinfo_query(self,data:list):
        psycopg2.extras.register_uuid()
        path = Path("app/database/insert_file_info.sql")
        with path.open('r') as file:
            query = file.read()
        try:
            self.cursor.executemany(query,data)
            self.conn.commit()
        except DatabaseError as e:
            self.conn.rollback()
            print(f"Error while executing {e}")
            raise e

    # Read all data from domain_content with filter
    def execute_domain_content_read_query(self,domain_uuid : str = None):
        path = Path("app/database/select_domaincontent.sql")
        with path.open('r') as file:
            query = file.read()
        try:
            if domain_uuid:
                query = f"{query} WHERE domain_uuid = '{domain_uuid}';"
            self.cursor.execute(query)
            rows = self.cursor.fetchall()
            self.conn.commit()
            return rows
        except DatabaseError as e:
            self.conn.rollback()
            print(f"Error while executing {e}")
            raise e
        
    # Read all data from file_info with filter
    def execute_file_info_read_query(self,file_uuid : str = None):
        path = Path("app/database/select_fileinfo.sql")
        with path.open('r') as file:
            query = file.read()
        try:
            if file_uuid:
                query = f"{query} WHERE file_uuid = '{file_uuid}';"
            self.cursor.execute(query)
            rows = self.cursor.fetchall()
            self.conn.commit()
            return rows
        except DatabaseError as e:
            self.conn.rollback()
            print(f"Error while executing {e}")
            raise e

    # Delete sentence range from domain_content 
    # Here sentence order nmber range parameters are included on deletion
    def execute_delete_file_sentences_query(self,file_uuid : str, sentence_order_number_start : int, sentence_order_number_end : int):
        query = f"""
            DELETE from domain_content
            where file_uuid = '{file_uuid}' and sentence_order_number between {sentence_order_number_start} and {sentence_order_number_end} ;

            UPDATE domain_content
            SET sentence_order_number = sentence_order_number-{sentence_order_number_end}
            where file_uuid = '{file_uuid}' and sentence_order_number > {sentence_order_number_end};
            """
        try:
            self.cursor.execute(query)
            self.conn.commit()
        except DatabaseError as e:
            self.conn.rollback()
            print(f"Error while executing {e}")
            raise e
    
    # Delete all data from the domain_content with filter
    def execute_domain_content_delete_query(self,file_uuid : str):
        path = Path("app/database/delete_domaincontent.sql")
        with path.open('r') as file:
            query = file.read()
        try:
            query = f"{query} WHERE file_uuid = '{file_uuid}';"
            self.cursor.execute(query)
            self.conn.commit()
        except DatabaseError as e:
            self.conn.rollback()
            print(f"Error while executing {e}")
            raise e
        
    # Delete all data from the file_info with filter
    def execute_file_info_delete_query(self,file_uuid : str):
        path = Path("app/database/delete_fileinfo.sql")
        with path.open('r') as file:
            query = file.read()
        try:
            query = f"{query} WHERE file_uuid = '{file_uuid}';"
            self.cursor.execute(query)
            self.conn.commit()
        except DatabaseError as e:
            self.conn.rollback()
            print(f"Error while executing {e}")
            raise e
            
    # Close cursor
    def close_cursor(self):
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
