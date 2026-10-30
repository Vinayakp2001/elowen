"""Order-status vocabulary and Shiprocket status mapping.

Single source of truth for the `orders.status` values used across the online
(PhonePe) and COD paths, plus the Shiprocket-text -> internal-status map used by
the Shiprocket status webhook.

See .kiro/specs/order-lifecycle-hardening/design.md ("Order status vocabulary").
"""

# Statuses that represent a real, fulfilment-bound order. Listings show these
# and retention must NEVER purge them regardless of age.
SUCCESS_STATES = frozenset({
    "paid",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
})

# Statuses that represent an attempt that did not become a fulfilment-bound
# order. Listings hide these and retention is allowed to purge them once the
# retention window elapses.
NON_SUCCESS_STATES = frozenset({
    "pending",
    "payment_failed",
    "abandoned",
    "cancelled",
})

# Forward-only ordering used by the Shiprocket webhook to guard against moving an
# order backwards (e.g. a late "shipped" event after "delivered"). Higher wins.
STATUS_RANK = {
    "pending": 0,
    "payment_failed": 0,
    "abandoned": 0,
    "paid": 1,
    "confirmed": 1,
    "processing": 2,
    "shipped": 3,
    "delivered": 4,
    "cancelled": 4,
}

# Shiprocket status text (upper-cased) -> internal order status.
SHIPROCKET_STATUS_MAP = {
    "PICKUP SCHEDULED": "shipped",
    "PICKUP GENERATED": "shipped",
    "PICKUP QUEUED": "shipped",
    "SHIPPED": "shipped",
    "IN TRANSIT": "shipped",
    "OUT FOR DELIVERY": "shipped",
    "DELIVERED": "delivered",
    "CANCELLED": "cancelled",
    "CANCELED": "cancelled",
    "RTO INITIATED": "cancelled",
    "RTO DELIVERED": "cancelled",
    "RTO ACKNOWLEDGED": "cancelled",
}
