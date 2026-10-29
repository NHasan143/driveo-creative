from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.functions import Lower

from quotes.choices import Locale


class User(AbstractUser):
    """The project's user model (AUTH_USER_MODEL): staff and customers.

    Staff have `is_staff`; customers are everyone else. Customers register on
    the website and sign in with their email (account/views.py).

    It keeps Django's original table, auth_user, so databases created before
    it existed switch over without moving data (see adopt_custom_user).
    """

    phone = models.CharField(max_length=40, blank=True)
    # Language of emails we send this person, e.g. password resets.
    locale = models.CharField(max_length=2, choices=Locale.choices, default=Locale.EN)

    class Meta:
        db_table = "auth_user"
        verbose_name = "User"
        verbose_name_plural = "Users"
        constraints = [
            # People sign in with their email, so an address may belong to one
            # account only, whatever its letter case.
            models.UniqueConstraint(
                Lower("email"),
                name="unique_user_email_ci",
                condition=~models.Q(email=""),
                violation_error_message="This email address is already registered.",
            ),
        ]

    def __str__(self):
        return self.username

    @property
    def is_customer(self):
        return not self.is_staff
