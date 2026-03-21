# api/urls.py
from django.urls import path
from .views import (
    google_login,
    login,
    medicine_detail,
    medicines,
    push_public_key,
    push_subscribe,
    push_status,
    push_test,
    push_unsubscribe,
    register,
)

urlpatterns = [
    path('register/', register),
    path('login/', login),
    path('google-login/', google_login),
    path('medicines/', medicines),
    path('medicines/<int:medicine_id>/', medicine_detail),
    path('push/public-key/', push_public_key),
    path('push/subscribe/', push_subscribe),
    path('push/unsubscribe/', push_unsubscribe),
    path('push/test/', push_test),
    path('push/status/', push_status),
]
