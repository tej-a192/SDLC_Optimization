from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate
from app.core.exceptions import NotFoundError, DatabaseError


class TagService:
    """Service class for handling tag-related business logic."""

    def __init__(self, db: Session):
        self.db = db

    def get_tags(self, skip: int = 0, limit: int = 100) -> List[Tag]:
        """
        Retrieve a list of tags with pagination.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of Tag objects
        """
        try:
            return self.db.query(Tag).offset(skip).limit(limit).all()
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to retrieve tags: {str(e)}")

    def get_tag(self, tag_id: UUID) -> Tag:
        """
        Retrieve a specific tag by ID.

        Args:
            tag_id: UUID of the tag to retrieve

        Returns:
            Tag object

        Raises:
            NotFoundError: If tag with given ID doesn't exist
        """
        try:
            tag = self.db.query(Tag).filter(Tag.id == tag_id).first()
            if not tag:
                raise NotFoundError(f"Tag with id {tag_id} not found")
            return tag
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to retrieve tag: {str(e)}")

    def create_tag(self, tag_data: TagCreate) -> Tag:
        """
        Create a new tag.

        Args:
            tag_data: TagCreate schema containing tag data

        Returns:
            Created Tag object
        """
        try:
            db_tag = Tag(**tag_data.dict())
            self.db.add(db_tag)
            self.db.commit()
            self.db.refresh(db_tag)
            return db_tag
        except SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to create tag: {str(e)}")

    def update_tag(self, tag_id: UUID, tag_data: TagUpdate) -> Tag:
        """
        Update an existing tag.

        Args:
            tag_id: UUID of the tag to update
            tag_data: TagUpdate schema containing updated data

        Returns:
            Updated Tag object

        Raises:
            NotFoundError: If tag with given ID doesn't exist
        """
        try:
            db_tag = self.get_tag(tag_id)
            update_data = tag_data.dict(exclude_unset=True)
            
            for field, value in update_data.items():
                setattr(db_tag, field, value)
                
            self.db.commit()
            self.db.refresh(db_tag)
            return db_tag
        except SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to update tag: {str(e)}")

    def delete_tag(self, tag_id: UUID) -> bool:
        """
        Delete a tag by ID.

        Args:
            tag_id: UUID of the tag to delete

        Returns:
            True if deletion was successful

        Raises:
            NotFoundError: If tag with given ID doesn't exist
        """
        try:
            db_tag = self.get_tag(tag_id)
            self.db.delete(db_tag)
            self.db.commit()
            return True
        except SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete tag: {str(e)}")

    def get_tags_by_name(self, name: str) -> List[Tag]:
        """
        Retrieve tags by name (case-insensitive partial match).

        Args:
            name: Name pattern to search for

        Returns:
            List of Tag objects matching the name pattern
        """
        try:
            return self.db.query(Tag).filter(Tag.name.ilike(f"%{name}%")).all()
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to retrieve tags by name: {str(e)}")