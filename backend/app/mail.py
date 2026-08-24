"""Password-reset delivery.

Sends through Resend when RESEND_API_KEY is configured. Without a key the link
is written to the application log instead, so local development and CI work
without an outbound mail provider.
"""
import json
import urllib.error
import urllib.request

from flask import current_app

_ENDPOINT = "https://api.resend.com/emails"


def send_reset_email(to_email, reset_url):
    api_key = current_app.config.get("RESEND_API_KEY")
    if not api_key:
        current_app.logger.info("Password reset for %s: %s", to_email, reset_url)
        return False

    payload = json.dumps(
        {
            "from": current_app.config["RESEND_FROM"],
            "to": [to_email],
            "subject": "Reset your PathWise password",
            "text": (
                "Use the link below to choose a new password. "
                "It expires in one hour.\n\n"
                f"{reset_url}\n\n"
                "If you did not ask for this, you can ignore this email."
            ),
        }
    ).encode()

    request = urllib.request.Request(
        _ENDPOINT,
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return 200 <= response.status < 300
    except (urllib.error.URLError, OSError) as exc:
        # Never surface provider failures to the caller: that would let an
        # attacker distinguish registered addresses from unregistered ones.
        current_app.logger.warning("Reset email to %s failed: %s", to_email, exc)
        return False
