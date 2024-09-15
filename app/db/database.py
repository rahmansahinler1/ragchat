import psycopg2

from .config import GenerateConfig
from .scripts.db_functions import DatabaseFunctions


class Database:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            db_config = GenerateConfig.config()
            cls._instance.conn = psycopg2.connect(**db_config)
            cls._instance.cursor = cls._instance.conn.cursor()
        return cls._instance

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def close(self):
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        Database._instance = None

if __name__ == "__main__":
    with Database() as db:
        dbf = DatabaseFunctions(db)
        dbf.initialize_tables()