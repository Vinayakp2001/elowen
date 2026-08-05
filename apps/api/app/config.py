from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    database_url: str

    # Stripe
    stripe_secret_key: str
    stripe_webhook_secret: str

    # App
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"

    # JWT
    jwt_secret_key: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/auth/google/callback"

    # Shiprocket (stubbed until enabled)
    shiprocket_enabled: bool = False
    shiprocket_email: str = ""
    shiprocket_password: str = ""
    shiprocket_base_url: str = "https://apiv2.shiprocket.in/v1/external"

    # Email (stubbed until enabled)
    email_enabled: bool = False
    resend_api_key: str = ""
    email_from: str = "noreply@elowen.com"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
