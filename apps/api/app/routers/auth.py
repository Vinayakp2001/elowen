from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlmodel import Session
from authlib.integrations.httpx_client import AsyncOAuth2Client

from app.config import settings
from app.database import get_session
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserOut,
    PasswordChangeRequest,
    ProfileUpdateRequest,
)
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    get_or_create_google_user,
    hash_password,
    register_user,
    verify_password,
    get_user_by_email,
)
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_session)):
    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    existing = get_user_by_email(request.email, db)
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = register_user(request.email, request.password, request.name, db)
    token = create_access_token(user.id, user.email)
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_session)):
    user = authenticate_user(request.email, request.password, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(user.id, user.email)
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.patch("/me", response_model=UserOut)
def update_profile(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    if request.name is not None:
        current_user.name = request.name
    current_user.updated_at = datetime.utcnow()
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)


@router.post("/change-password")
def change_password(
    request: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    if not current_user.password_hash:
        raise HTTPException(status_code=400, detail="This account uses Google sign-in. Password change is not available.")

    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters.")

    current_user.password_hash = hash_password(request.new_password)
    current_user.updated_at = datetime.utcnow()
    db.add(current_user)
    db.commit()
    return {"message": "Password updated successfully."}


@router.get("/google")
def google_oauth_redirect():
    if not settings.google_client_id:
        raise HTTPException(status_code=503, detail="Google OAuth is not configured.")

    params = (
        f"?client_id={settings.google_client_id}"
        f"&redirect_uri={settings.google_redirect_uri}"
        f"&response_type=code"
        f"&scope=openid%20email%20profile"
        f"&access_type=offline"
    )
    return RedirectResponse(url=GOOGLE_AUTH_URL + params)


@router.get("/google/callback")
async def google_oauth_callback(code: str, db: Session = Depends(get_session)):
    if not settings.google_client_id:
        raise HTTPException(status_code=503, detail="Google OAuth is not configured.")

    async with AsyncOAuth2Client(
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
    ) as client:
        try:
            token_response = await client.fetch_token(
                GOOGLE_TOKEN_URL,
                code=code,
                redirect_uri=settings.google_redirect_uri,
            )
        except Exception:
            raise HTTPException(status_code=400, detail="Failed to exchange OAuth code.")

        try:
            resp = await client.get(GOOGLE_USERINFO_URL)
            userinfo = resp.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Failed to fetch Google user info.")

    google_id = userinfo.get("id")
    email = userinfo.get("email")
    name = userinfo.get("name")
    avatar_url = userinfo.get("picture")

    if not google_id or not email:
        raise HTTPException(status_code=400, detail="Incomplete user info from Google.")

    user = get_or_create_google_user(google_id, email, name, avatar_url, db)
    token = create_access_token(user.id, user.email)

    # Redirect to frontend with token in query param
    # Frontend reads it once and stores in memory/cookie
    return RedirectResponse(
        url=f"{settings.frontend_url}/auth/callback?token={token}"
    )
