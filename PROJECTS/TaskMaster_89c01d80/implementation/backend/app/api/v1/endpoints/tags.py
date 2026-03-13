from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.api.v1.endpoints.auth import get_current_active_user
from app.schemas.tag import TagCreate, TagUpdate, TagResponse
from app.models.user import User
from app.models.tag import Tag as TagModel
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=List[TagResponse])
def read_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve all tags for the current user.
    """
    try:
        tags = db.query(TagModel).filter(TagModel.owner_id == current_user.id).all()
        return tags
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve tags"
        )

@router.post("/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(
    tag_in: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new tag for the current user.
    """
    try:
        tag = TagModel(
            name=tag_in.name,
            color=tag_in.color,
            owner_id=current_user.id
        )
        db.add(tag)
        db.commit()
        db.refresh(tag)
        return tag
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tag"
        )

@router.put("/{tag_id}", response_model=TagResponse)
def update_tag(
    tag_id: uuid.UUID,
    tag_in: TagUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an existing tag by ID.
    """
    try:
        tag = db.query(TagModel).filter(
            TagModel.id == tag_id,
            TagModel.owner_id == current_user.id
        ).first()
        
        if not tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found"
            )
            
        if tag_in.name is not None:
            tag.name = tag_in.name
        if tag_in.color is not None:
            tag.color = tag_in.color
            
        db.commit()
        db.refresh(tag)
        return tag
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update tag"
        )

@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a tag by ID.
    """
    try:
        tag = db.query(TagModel).filter(
            TagModel.id == tag_id,
            TagModel.owner_id == current_user.id
        ).first()
        
        if not tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found"
            )
            
        db.delete(tag)
        db.commit()
        return
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete tag"
        )