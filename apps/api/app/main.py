from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import create_db_and_tables
from app.config import settings
from app.routers import health, cart, checkout, webhooks, orders, newsletter, wishlist, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="Elowen API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(cart.router)
app.include_router(checkout.router)
app.include_router(webhooks.router)
app.include_router(orders.router)
app.include_router(newsletter.router)
app.include_router(wishlist.router)
