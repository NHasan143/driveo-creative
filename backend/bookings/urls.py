from django.urls import path

from .views import QuoteRequestCreateView

urlpatterns = [
    path("quote-requests/", QuoteRequestCreateView.as_view(), name="quote-request-create"),
]
