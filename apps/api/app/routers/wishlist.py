from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Literal, List
from app.database import get_session
from app.dependencies import get_current_user
from app.models.user import User
from app.models.wishlist import Wishlist, WishlistItem

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


class WishlistItemRequest(BaseModel):
    sku: str
    action: Literal["add", "remove"]


class WishlistSyncRequest(BaseModel):
    skus: List[str]


class WishlistResponse(BaseModel):
    wishlist: List[str]


@router.post("", response_model=WishlistResponse)
def update_wishlist(
    request: WishlistItemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    wishlist = db.exec(
        select(Wishlist).where(Wishlist.user_id == current_user.id)
    ).first()

    if not wishlist:
        if request.action == "remove":
            return WishlistResponse(wishlist=[])
        wishlist = Wishlist(user_id=current_user.id)
        db.add(wishlist)
        db.flush()

    if request.action == "add":
        existing = db.exec(
            select(WishlistItem).where(
                WishlistItem.wishlist_id == wishlist.id,
                WishlistItem.product_sku == request.sku,
            )
        ).first()
        if not existing:
            db.add(WishlistItem(wishlist_id=wishlist.id, product_sku=request.sku))
    else:
        item = db.exec(
            select(WishlistItem).where(
                WishlistItem.wishlist_id == wishlist.id,
                WishlistItem.product_sku == request.sku,
            )
        ).first()
        if item:
            db.delete(item)

    db.commit()
    items = db.exec(
        select(WishlistItem).where(WishlistItem.wishlist_id == wishlist.id)
    ).all()
    return WishlistResponse(wishlist=[i.product_sku for i in items])


@router.post("/sync", response_model=WishlistResponse)
def sync_wishlist(
    request: WishlistSyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Merge guest localStorage wishlist into the authenticated user's server wishlist."""
    wishlist = db.exec(
        select(Wishlist).where(Wishlist.user_id == current_user.id)
    ).first()

    if not wishlist:
        wishlist = Wishlist(user_id=current_user.id)
        db.add(wishlist)
        db.flush()

    for sku in request.skus:
        existing = db.exec(
            select(WishlistItem).where(
                WishlistItem.wishlist_id == wishlist.id,
                WishlistItem.product_sku == sku,
            )
        ).first()
        if not existing:
            db.add(WishlistItem(wishlist_id=wishlist.id, product_sku=sku))

    db.commit()
    items = db.exec(
        select(WishlistItem).where(WishlistItem.wishlist_id == wishlist.id)
    ).all()
    return WishlistResponse(wishlist=[i.product_sku for i in items])


@router.get("", response_model=WishlistResponse)
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    wishlist = db.exec(
        select(Wishlist).where(Wishlist.user_id == current_user.id)
    ).first()
    if not wishlist:
        return WishlistResponse(wishlist=[])
    items = db.exec(
        select(WishlistItem).where(WishlistItem.wishlist_id == wishlist.id)
    ).all()
    return WishlistResponse(wishlist=[i.product_sku for i in items])
