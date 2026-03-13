from sqlalchemy import Column, String, DateTime, UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from ..database import Base


class Tag(Base):
    __tablename__ = "tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True, nullable=False)
    color = Column(String, nullable=True)  # Optional color coding for UI
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to tasks (many-to-many)
    tasks = relationship("Task", secondary="task_tags", back_populates="tags")