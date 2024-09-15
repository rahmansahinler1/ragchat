from psycopg2 import DatabaseError
from pathlib import Path
import logging


class DatabaseFunctions:
    def __init__(self, database):
        self.db = database
        self.main_folder = Path(__file__).resolve().parent.parent
    
    def initialize_tables(self):
        sql_path = self.main_folder / "sql" / "table_initialize.sql"
        with sql_path.open('r') as file:
            query = file.read()
        try:
            self.db.cursor.execute(query)
            self.db.conn.commit()
        except DatabaseError as e:
            self.conn.rollback()
            raise e
    
    def reset_database(self):
        sql_path = self.main_folder / "sql" / "database_reset.sql"
        with sql_path.open('r') as file:
            query = file.read()
        try:
            self.db.cursor.execute(query)
            self.db.conn.commit()
        except DatabaseError as e:
            self.conn.rollback()
            raise e
        
    def insert_file_info(self, file_info):
        query = """
        INSERT INTO domain_info (domain_name, file_name, file_date, file_sentences)
        VALUES (%s, %s, %s, %s)
        """
        try:
            self.db.cursor.execute(query, (
                file_info['domain_name'],
                file_info['file_name'],
                file_info['file_date'],
                file_info['file_sentences']
            ))
            self.db.conn.commit()
            logging.info(f"File info inserted successfully: {file_info['file_name']}")
        except DatabaseError as e:
            self.db.conn.rollback()
            logging.error(f"Error inserting file info: {e}")
            raise e
