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
    
    # Create Master Database
    # def execute_create_database_query(self):
    #     path = Path("app/database/create_db.sql")
    #     with path.open('r') as file:
    #         query = file.read()
    #     try:
    #         self.cursor.execute(query)
    #         self.conn.commit()
    #     except DatabaseError as e:
    #         self.conn.rollback()
    #         print(f"Error while executing {e}")
    #         raise e
    
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
    def execute_insert_domaincontent_query(self,data:list):
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
        
    # Insert to domain_info table    
    def execute_insert_domaininfo_query(self,data:list):
        psycopg2.extras.register_uuid()
        path = Path("app/database/insert_domain_info.sql")
        with path.open('r') as file:
            query = file.read()
        try:
            self.cursor.executemany(query,data)
            self.conn.commit()
        except DatabaseError as e:
            self.conn.rollback()
            print(f"Error while executing {e}")
            raise e
    
    # Read from domain_content with or without filtering
    def execute_read_query(self,domain_name : str = None):
        path = Path("app/database/select.sql")
        with path.open('r') as file:
            query = file.read()
        try:
            if domain_name:
                query = f"{query} WHERE domain_name = '{domain_name}';"
            self.cursor.execute(query)
            rows = self.cursor.fetchall()
            self.conn.commit()
            return rows
        except DatabaseError as e:
            self.conn.rollback()
            print(f"Error while executing {e}")
            raise e
        
    # Delete pages on domain_content
    def execute_delete_pdf_sentences_query(self,pdf_name : str ,page_start : int ,page_advance : int ,domain_name : str = None):
        try:
            if domain_name:
                query = f""" with delete_pages as (with cte_deleted as (select sum(s)
                    from
                    (SELECT domain_name,pdf_name,UNNEST (page_sentences) as s
                        from public.domain_info where pdf_name = '{pdf_name}' LIMIT {page_advance} OFFSET {page_start})
                        ),
                    cte_start as (select sum(s)
                    from
                    (SELECT domain_name,pdf_name,UNNEST (page_sentences) as s
                        from public.domain_info where pdf_name = '{pdf_name}' LIMIT {page_start})
                        )
                    select * from public.domain_content WHERE domain_name = {domain_name} LIMIT (select * from cte_deleted) OFFSET (select * from cte_start))
                    select * from delete_pages ;
            """
            else:
                query = f""" with cte_deleted as (select sum(s) from
                (SELECT domain_name,pdf_name,UNNEST (page_sentences) as s
                    from public.domain_info where pdf_name = '{pdf_name}' LIMIT {page_advance} OFFSET {page_start})
                    ),
                cte_start as (select sum(s)
                from
                (SELECT domain_name,pdf_name,UNNEST (page_sentences) as s
                    from public.domain_info where pdf_name = '{pdf_name}' LIMIT {page_start})
                    )
                select * from public.domain_content  LIMIT (select * from cte_deleted) OFFSET (select * from cte_start);
            """
            self.cursor.execute(query)
            self.conn.commit()
        except DatabaseError as e:
            self.conn.rollback()
            print(f"Error while executing {e}")
            raise e
    
    # Delete all data frm the domain
    def execute_delete_query(self,domain_name : str = None):
        path = Path("app/database/delete.sql")
        with path.open('r') as file:
            query = file.read()
        try:
            if domain_name:
                query = f"{query} WHERE domain_name = '{domain_name}';"
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
