"""Basic tests to verify the setup is working."""

import pytest
import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))


def test_imports():
    """Test that we can import the main modules."""
    try:
        import models
        import server
        assert True
    except ImportError as e:
        pytest.fail(f"Failed to import modules: {e}")


def test_environment_variables():
    """Test that we can load environment variables."""
    from dotenv import load_dotenv
    
    # Load test environment
    test_env_path = backend_dir / ".env.test"
    load_dotenv(test_env_path)
    
    # Check that we can access environment variables
    assert os.getenv("DB_NAME") is not None
    assert os.getenv("JWT_SECRET") is not None


def test_basic_math():
    """Basic test to ensure pytest is working."""
    assert 1 + 1 == 2
    assert "hello" == "hello"