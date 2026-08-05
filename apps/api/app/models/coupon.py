from datetime import datetime
from decimal import Decimal
from typing import Optional
import uuid

from sqlmodel import Field, SQLModel


class Coupon(SQLModel, table=True):
    __tablename__: str = "coupons"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    code: str = Field(unique=True, index=True)
    discount_type: str  # percent | fixed
    discount_value: Decimal = Field(decimal_places=2, max_digits=10)
    max_uses: Optional[int] = None
    uses_count: int = Field(default=0)
    expires_at: Optional[datetime] = None
    active: bool = Field(default=True)

