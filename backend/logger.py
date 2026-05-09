"""
Centralized structured logging for the backend.

Replaces scattered print statements with standard logging.
Future-proof for adding Datadog, Sentry, or JSON logs in production.
"""

import logging
import sys

def get_logger(name: str = "ai_lead_gen") -> logging.Logger:
    """Get a configured logger instance."""
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        
        # Format: [Time] [Level] Message
        formatter = logging.Formatter(
            fmt="%(asctime)s [%(levelname)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        # Prevent propagation to root logger to avoid double-printing
        logger.propagate = False
        
    return logger

# Global instance for easy importing
logger = get_logger()
