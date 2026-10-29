from django.urls import path

from .staff_views import (
    CustomerDetailView,
    CustomerListView,
    StaffUserDetailView,
    StaffUserListView,
    StaffUserPasswordView,
)
from .views import (
    MyQuoteRequestsView,
    PasswordResetConfirmView,
    PasswordResetView,
    PasswordView,
    ProfileView,
    RegisterView,
    SessionView,
)

urlpatterns = [
    # Customers (website)
    path("account/session/", SessionView.as_view(), name="account-session"),
    path("account/register/", RegisterView.as_view(), name="account-register"),
    path("account/profile/", ProfileView.as_view(), name="account-profile"),
    path("account/password/", PasswordView.as_view(), name="account-password"),
    path("account/password-reset/", PasswordResetView.as_view(), name="account-password-reset"),
    path(
        "account/password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="account-password-reset-confirm",
    ),
    path("account/quote-requests/", MyQuoteRequestsView.as_view(), name="account-quote-requests"),
    # Staff (content admin)
    path("staff/customers/", CustomerListView.as_view(), name="staff-customers"),
    path("staff/customers/<int:pk>/", CustomerDetailView.as_view(), name="staff-customer"),
    path("staff/users/", StaffUserListView.as_view(), name="staff-users"),
    path("staff/users/<int:pk>/", StaffUserDetailView.as_view(), name="staff-user"),
    path("staff/users/<int:pk>/password/", StaffUserPasswordView.as_view(), name="staff-user-password"),
]
