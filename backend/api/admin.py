from django.contrib import admin

from .models import Medicine, PushSubscription, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "google_id")
    search_fields = ("name", "email", "google_id")


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "name", "dosage", "date", "time", "frequency", "taken", "last_notified_date")
    search_fields = ("name", "user__email", "dosage", "notes")
    list_filter = ("taken", "frequency", "date")


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "created_at")
    search_fields = ("user__email", "endpoint")
