from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.newsletter import NewsletterSignup
from app.schemas.newsletter import NewsletterSubscribeRequest, NewsletterSubscribeResponse

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.post("/subscribe", response_model=NewsletterSubscribeResponse)
def subscribe(request: NewsletterSubscribeRequest, db: Session = Depends(get_session)):
    existing = db.exec(
        select(NewsletterSignup).where(NewsletterSignup.email == request.email)
    ).first()

    if existing:
        # Already subscribed — return success silently
        return NewsletterSubscribeResponse(subscribed=True)

    signup = NewsletterSignup(email=request.email)
    db.add(signup)
    db.commit()
    return NewsletterSubscribeResponse(subscribed=True)
