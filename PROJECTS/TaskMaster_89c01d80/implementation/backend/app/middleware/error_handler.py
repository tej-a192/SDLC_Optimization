import logging
from typing import Union

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.middleware.auth_middleware import AuthMiddleware

# Configure logger
logger = logging.getLogger(__name__)

class ErrorHandler:
    """Global error handling middleware for FastAPI application"""
    
    def __init__(self, app):
        self.app = app
        self.register_handlers()
        
    def register_handlers(self):
        """Register exception handlers with the FastAPI application"""
        @self.app.exception_handler(StarletteHTTPException)
        async def http_exception_handler(request: Request, exc: StarletteHTTPException):
            """Handle HTTP exceptions"""
            logger.error(f"HTTP error occurred: {exc.status_code} - {exc.detail}")
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "error": {
                        "type": "http_exception",
                        "message": exc.detail,
                        "status_code": exc.status_code
                    }
                }
            )
            
        @self.app.exception_handler(HTTPException)
        async def fastapi_http_exception_handler(request: Request, exc: HTTPException):
            """Handle FastAPI HTTP exceptions"""
            logger.error(f"FastAPI HTTP error occurred: {exc.status_code} - {exc.detail}")
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "error": {
                        "type": "http_exception",
                        "message": exc.detail,
                        "status_code": exc.status_code
                    }
                }
            )
            
        @self.app.exception_handler(Exception)
        async def general_exception_handler(request: Request, exc: Exception):
            """Handle all unhandled exceptions"""
            logger.error(f"Unhandled exception occurred: {str(exc)}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={
                    "error": {
                        "type": "internal_server_error",
                        "message": "An unexpected error occurred",
                        "status_code": 500
                    }
                }
            )
            
        @self.app.exception_handler(ValueError)
        async def value_error_handler(request: Request, exc: ValueError):
            """Handle value errors"""
            logger.error(f"Value error occurred: {str(exc)}")
            return JSONResponse(
                status_code=400,
                content={
                    "error": {
                        "type": "value_error",
                        "message": str(exc),
                        "status_code": 400
                    }
                }
            )
            
        @self.app.exception_handler(KeyError)
        async def key_error_handler(request: Request, exc: KeyError):
            """Handle key errors"""
            logger.error(f"Key error occurred: {str(exc)}")
            return JSONResponse(
                status_code=400,
                content={
                    "error": {
                        "type": "key_error",
                        "message": f"Missing required field: {str(exc)}",
                        "status_code": 400
                    }
                }
            )