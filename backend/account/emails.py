"""Emails to account holders, in their language."""

import logging

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlencode, urlsafe_base64_encode

logger = logging.getLogger(__name__)

PASSWORD_RESET = {
    "en": (
        "Reset your Driveo password",
        "Hello {name},\n\n"
        "We received a request to reset the password of your Driveo Exclusive account. "
        "Choose a new password here:\n\n{link}\n\n"
        "The link works once and expires in {hours} hours. If you didn't ask for this, "
        "ignore this email: your password stays the same.\n\n"
        "Driveo Exclusive",
    ),
    "fr": (
        "Réinitialisez votre mot de passe Driveo",
        "Bonjour {name},\n\n"
        "Nous avons reçu une demande de réinitialisation du mot de passe de votre compte "
        "Driveo Exclusive. Choisissez un nouveau mot de passe ici :\n\n{link}\n\n"
        "Le lien ne fonctionne qu'une fois et expire dans {hours} heures. Si vous n'êtes pas "
        "à l'origine de cette demande, ignorez cet e-mail : votre mot de passe reste inchangé.\n\n"
        "Driveo Exclusive",
    ),
    "bg": (
        "Нулирайте паролата си за Driveo",
        "Здравейте, {name},\n\n"
        "Получихме заявка за нулиране на паролата на профила ви в Driveo Exclusive. "
        "Изберете нова парола тук:\n\n{link}\n\n"
        "Връзката работи веднъж и изтича след {hours} часа. Ако не сте поискали това, "
        "игнорирайте този имейл: паролата ви остава същата.\n\n"
        "Driveo Exclusive",
    ),
    "ar": (
        "إعادة تعيين كلمة مرور Driveo",
        "مرحبًا {name}،\n\n"
        "تلقّينا طلبًا لإعادة تعيين كلمة مرور حسابك في Driveo Exclusive. "
        "اختر كلمة مرور جديدة من هنا:\n\n{link}\n\n"
        "يعمل الرابط مرة واحدة وتنتهي صلاحيته خلال {hours} ساعات. إذا لم تطلب ذلك، "
        "فتجاهل هذه الرسالة وستبقى كلمة مرورك كما هي.\n\n"
        "Driveo Exclusive",
    ),
}


def password_reset_link(user, locale):
    query = urlencode(
        {
            "lang": locale,
            "uid": urlsafe_base64_encode(force_bytes(user.pk)),
            "token": default_token_generator.make_token(user),
        }
    )
    return f"{settings.WEBSITE_BASE_URL.rstrip('/')}/account/reset-password?{query}"


def send_password_reset(user, locale=None):
    """Emails a one-time reset link. Failures are logged, never shown: the
    response must look the same whether or not the address has an account."""
    locale = locale if locale in PASSWORD_RESET else user.locale
    subject, body = PASSWORD_RESET.get(locale, PASSWORD_RESET["en"])
    message = body.format(
        name=user.first_name or user.get_username(),
        link=password_reset_link(user, locale),
        hours=settings.PASSWORD_RESET_TIMEOUT // 3600,
    )
    try:
        send_mail(subject, message, None, [user.email])
    except Exception:
        logger.exception("Password reset email to user %s failed", user.pk)
