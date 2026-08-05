from pydantic import BaseModel, EmailStr


class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr


class NewsletterSubscribeResponse(BaseModel):
    subscribed: bool
