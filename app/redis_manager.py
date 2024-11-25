from redis import Redis
from typing import Optional, Any
import pickle
import logging
from functools import wraps

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RedisConnectionError(Exception):
    """Custom exception for Redis connection issues"""

    pass


class RedisManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RedisManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if not self._initialized:
            try:
                self.client = Redis(
                    host="localhost",
                    port=6380,
                    db=0,
                    decode_responses=False,
                    socket_timeout=5,
                )
                self._initialized = True
                logger.info("Redis connection established")
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {str(e)}")
                raise RedisConnectionError(f"Redis connection failed: {str(e)}")

    def _handle_connection(func):
        """Decorator to handle Redis connection errors"""

        @wraps(func)
        def wrapper(self, *args, **kwargs):
            try:
                return func(self, *args, **kwargs)
            except Exception as e:
                logger.error(f"Redis operation failed: {str(e)}")
                raise RedisConnectionError(f"Redis operation failed: {str(e)}")

        return wrapper

    @_handle_connection
    def set_data(self, key: str, value: Any, expiry: int = 1800) -> bool:
        """Store data in Redis with expiry time"""
        try:
            pickled_value = pickle.dumps(value)
            return self.client.set(key, pickled_value, ex=expiry)
        except Exception as e:
            logger.error(f"Failed to set data for key {key}: {str(e)}")
            return False

    @_handle_connection
    def get_data(self, key: str) -> Optional[Any]:
        """Retrieve data from Redis"""
        try:
            data = self.client.get(key)
            return pickle.loads(data) if data else None
        except Exception as e:
            logger.error(f"Failed to get data for key {key}: {str(e)}")
            return None

    @_handle_connection
    def delete_data(self, key: str) -> bool:
        """Delete data from Redis"""
        try:
            return bool(self.client.delete(key))
        except Exception as e:
            logger.error(f"Failed to delete key {key}: {str(e)}")
            return False

    @_handle_connection
    def clear_user_data(self, user_id: str) -> bool:
        """Clear all data for a specific user"""
        try:
            pattern = f"user:{user_id}:*"
            keys = self.client.keys(pattern)
            if keys:
                return bool(self.client.delete(*keys))
            return True
        except Exception as e:
            logger.error(f"Failed to clear data for user {user_id}: {str(e)}")
            return False

    @_handle_connection
    def get_memory_usage(self) -> dict:
        """Get Redis memory statistics"""
        try:
            info = self.client.info(section="memory")
            return {
                "used_memory": info["used_memory_human"],
                "peak_memory": info["used_memory_peak_human"],
                "fragmentation": info["mem_fragmentation_ratio"],
            }
        except Exception as e:
            logger.error(f"Failed to get memory usage: {str(e)}")
            return {}

    def is_connected(self) -> bool:
        """Check if Redis connection is alive"""
        try:
            return self.client.ping()
        except Exception:
            return False


def test_redis_connection():
    try:
        redis_manager = RedisManager()

        # Test connection
        assert redis_manager.is_connected(), "Redis connection failed"

        # Test set/get operations
        test_data = {"test": "data"}
        assert redis_manager.set_data("test_key", test_data), "Failed to set data"

        retrieved_data = redis_manager.get_data("test_key")
        assert retrieved_data == test_data, "Data mismatch"

        # Test deletion
        assert redis_manager.delete_data("test_key"), "Failed to delete data"

        print("Redis connection and operations test passed!")

    except Exception as e:
        print(f"Test failed: {str(e)}")


if __name__ == "__main__":
    test_redis_connection()
