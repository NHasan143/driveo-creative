from django.urls import path

from .views import BookingCancelView, BookingCreateView, BookingDetailView, MyBookingsView

urlpatterns = [
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),
    path("bookings/<str:reference>/", BookingDetailView.as_view(), name="booking-detail"),
    path("bookings/<str:reference>/cancel/", BookingCancelView.as_view(), name="booking-cancel"),
    path("account/bookings/", MyBookingsView.as_view(), name="account-bookings"),
]
