import smtplib
from email.mime.text import MIMEText

def send_emails(email_payload: dict) -> str:
    """
    Sends emails via SMTP.
    Expects a dictionary like:
    {
      "alice@example.com": "Email content here...",
      ...
    }
    """

    sender_email = "youremail@example.com"
    sender_password = "your_app_password"  # For Gmail, use App Passwords

    smtp_server = "smtp.gmail.com"
    smtp_port = 587

    sent_to = []

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(sender_email, sender_password)

        for recipient, body in email_payload.items():
            msg = MIMEText(body, "plain", "utf-8")
            msg["Subject"] = "Meeting Summary and Action Items"
            msg["From"] = sender_email
            msg["To"] = recipient

            server.sendmail(sender_email, recipient, msg.as_string())
            sent_to.append(recipient)

    return f"Sent emails to: {', '.join(sent_to)}"
