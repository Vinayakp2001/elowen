"""
Transactional email service.

Uses Resend (https://resend.com) as the provider.
Set EMAIL_ENABLED=true and add RESEND_API_KEY in .env to activate.
Until then, all send calls are logged and silently skipped.
"""

import logging
import httpx
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)

RESEND_SEND_URL = "https://api.resend.com/emails"


async def _send(to: str, subject: str, html: str) -> bool:
    if not settings.email_enabled:
        logger.info("[Email STUB] To: %s | Subject: %s", to, subject)
        return True

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                RESEND_SEND_URL,
                headers={
                    "Authorization": f"Bearer {settings.resend_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": settings.email_from,
                    "to": [to],
                    "subject": subject,
                    "html": html,
                },
            )
            resp.raise_for_status()
            return True
    except Exception as e:
        logger.error("[Email] Failed to send to %s: %s", to, str(e))
        return False


async def send_order_confirmation(
    to: str,
    order_id: str,
    items: list,
    total: float,
    shipping_address: dict,
) -> bool:
    items_html = "".join(
        f"<tr><td style='padding:8px 0;'>{item['name']}</td>"
        f"<td style='padding:8px 0;text-align:right;'>x{item['quantity']}</td>"
        f"<td style='padding:8px 0;text-align:right;'>&#8377;{item['price']:.2f}</td></tr>"
        for item in items
    )
    address = shipping_address
    html = f"""
    <div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;color:#2C2C2C;">
      <div style="padding:40px 0;border-bottom:1px solid #E8D9C0;">
        <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;letter-spacing:-0.01em;margin:0;">
          Elowen
        </h1>
      </div>
      <div style="padding:40px 0;">
        <p style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#8C7B6B;margin:0 0 16px;">
          Order Confirmation
        </p>
        <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:400;margin:0 0 24px;">
          Thank you for your order.
        </h2>
        <p style="font-size:13px;color:#8C7B6B;margin:0 0 32px;">
          Order reference: <strong style="color:#2C2C2C;">{order_id[:8].upper()}</strong>
        </p>
        <table style="width:100%;border-collapse:collapse;border-top:1px solid #E8D9C0;">
          {items_html}
          <tr style="border-top:1px solid #E8D9C0;">
            <td colspan="2" style="padding:12px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Total</td>
            <td style="padding:12px 0;text-align:right;font-weight:500;">&#8377;{total:.2f}</td>
          </tr>
        </table>
        <div style="margin-top:32px;">
          <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8C7B6B;margin:0 0 8px;">
            Shipping to
          </p>
          <p style="font-size:14px;margin:0;line-height:1.6;">
            {address.get('name','')}<br/>
            {address.get('address','')}<br/>
            {address.get('city','')}, {address.get('state','')} {address.get('pincode','')}<br/>
            India
          </p>
        </div>
      </div>
      <div style="padding:32px 0;border-top:1px solid #E8D9C0;">
        <p style="font-size:12px;color:#8C7B6B;margin:0;">
          Questions? Reply to this email or contact us at hello@elowen.com
        </p>
      </div>
    </div>
    """
    return await _send(to, "Your Elowen order has been confirmed", html)


async def send_shipping_update(
    to: str,
    order_id: str,
    awb_code: str,
    courier_name: str,
    tracking_url: Optional[str] = None,
) -> bool:
    track_section = (
        f'<a href="{tracking_url}" style="display:inline-block;margin-top:16px;'
        f'font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#2C2C2C;'
        f'border-bottom:1px solid #2C2C2C;text-decoration:none;">Track your order</a>'
        if tracking_url
        else ""
    )
    html = f"""
    <div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;color:#2C2C2C;">
      <div style="padding:40px 0;border-bottom:1px solid #E8D9C0;">
        <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;margin:0;">Elowen</h1>
      </div>
      <div style="padding:40px 0;">
        <p style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#8C7B6B;margin:0 0 16px;">
          Your order is on its way
        </p>
        <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:400;margin:0 0 24px;">
          Your piece has been dispatched.
        </h2>
        <p style="font-size:13px;color:#8C7B6B;margin:0 0 8px;">Courier: {courier_name}</p>
        <p style="font-size:13px;color:#8C7B6B;margin:0 0 8px;">AWB: {awb_code}</p>
        {track_section}
      </div>
    </div>
    """
    return await _send(to, "Your Elowen order has been dispatched", html)


async def send_newsletter_welcome(to: str) -> bool:
    html = """
    <div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;color:#2C2C2C;">
      <div style="padding:40px 0;border-bottom:1px solid #E8D9C0;">
        <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;margin:0;">Elowen</h1>
      </div>
      <div style="padding:40px 0;">
        <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:400;margin:0 0 16px;">
          Welcome to the inner circle.
        </h2>
        <p style="font-size:14px;color:#8C7B6B;line-height:1.7;margin:0;">
          You will be the first to know about new collections, exclusive events,
          and stories from the atelier.
        </p>
      </div>
    </div>
    """
    return await _send(to, "Welcome to Elowen", html)
