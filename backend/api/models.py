# api/models.py
from django.db import models


class User(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, blank=True, default="")
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    google_id = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return self.email
    
class Medicine(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=100, blank=True, default="")
    date = models.DateField()
    time = models.CharField(max_length=8)
    frequency = models.CharField(max_length=30, default="daily")
    notes = models.TextField(blank=True, default="")
    taken = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_notified_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["date", "time", "id"]


class MedicineAdherence(models.Model):
    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.CASCADE,
        related_name="adherence_logs",
    )
    date = models.DateField()
    taken_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["medicine", "date"],
                name="unique_medicine_adherence_per_day",
            )
        ]


class PushSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="push_subscriptions")
    endpoint = models.TextField(unique=True)
    p256dh = models.TextField()
    auth = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]
