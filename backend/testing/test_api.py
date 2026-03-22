from unittest.mock import patch

from django.test import Client, TestCase

from api.models import Medicine, PushSubscription, User


class AuthApiTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_register_creates_user(self):
        response = self.client.post(
            "/api/register/",
            {"name": "Manya", "email": "manya@example.com", "password": "secret123"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["email"], "manya@example.com")
        self.assertTrue(User.objects.filter(email="manya@example.com").exists())

    def test_login_rejects_wrong_password(self):
        User.objects.create(name="Manya", email="manya@example.com", password="secret123")

        response = self.client.post(
            "/api/login/",
            {"email": "manya@example.com", "password": "wrong-pass"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["error"], "Wrong password")


class MedicineApiTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create(
            name="Manya",
            email="manya@example.com",
            password="secret123",
        )

    def test_create_and_list_medicines_for_user(self):
        create_response = self.client.post(
            "/api/medicines/",
            {
                "user_id": self.user.id,
                "name": "Paracetamol",
                "dosage": "500mg",
                "date": "2026-03-22",
                "time": "08:30",
                "frequency": "daily",
                "notes": "After breakfast",
            },
        )

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(create_response.json()["name"], "Paracetamol")

        list_response = self.client.get("/api/medicines/", {"user_id": self.user.id})

        self.assertEqual(list_response.status_code, 200)
        payload = list_response.json()
        self.assertEqual(len(payload), 1)
        self.assertEqual(payload[0]["dosage"], "500mg")

    def test_create_medicine_validates_date_and_time(self):
        response = self.client.post(
            "/api/medicines/",
            {
                "user_id": self.user.id,
                "name": "Vitamin C",
                "date": "22-03-2026",
                "time": "8:30 AM",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()["error"],
            "date must be YYYY-MM-DD and time must be HH:MM",
        )

    def test_patch_updates_taken_status(self):
        medicine = Medicine.objects.create(
            user=self.user,
            name="Ibuprofen",
            dosage="200mg",
            date="2026-03-22",
            time="09:00",
        )
        medicine_id = medicine.pk
        self.assertIsNotNone(medicine_id)

        response = self.client.patch(
            f"/api/medicines/{medicine_id}/?user_id={self.user.id}",
            data='{"taken": true}',
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        medicine.refresh_from_db()
        self.assertTrue(medicine.taken)

    def test_delete_requires_matching_user(self):
        other_user = User.objects.create(
            name="Other",
            email="other@example.com",
            password="secret456",
        )
        medicine = Medicine.objects.create(
            user=self.user,
            name="Ibuprofen",
            dosage="200mg",
            date="2026-03-22",
            time="09:00",
        )
        medicine_id = medicine.pk
        self.assertIsNotNone(medicine_id)

        response = self.client.delete(
            f"/api/medicines/{medicine_id}/?user_id={other_user.id}"
        )

        self.assertEqual(response.status_code, 404)
        self.assertTrue(Medicine.objects.filter(pk=medicine_id).exists())


class PushApiTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create(
            name="Manya",
            email="manya@example.com",
            password="secret123",
        )

    def test_push_subscribe_and_status(self):
        subscribe_response = self.client.post(
            "/api/push/subscribe/",
            {
                "user_id": self.user.id,
                "subscription": {
                    "endpoint": "https://push.example.test/subscription-1",
                    "keys": {
                        "p256dh": "p256dh-key",
                        "auth": "auth-key",
                    },
                },
            },
            content_type="application/json",
        )

        self.assertEqual(subscribe_response.status_code, 200)
        self.assertTrue(
            PushSubscription.objects.filter(user=self.user).exists()
        )

        status_response = self.client.get(
            "/api/push/status/", {"user_id": self.user.id}
        )

        self.assertEqual(status_response.status_code, 200)
        self.assertEqual(status_response.json()["subscription_count"], 1)

    @patch("api.views.send_push_to_user")
    def test_push_test_uses_notification_sender(self, mock_send_push_to_user):
        mock_send_push_to_user.return_value = {"ok": True}

        response = self.client.post("/api/push/test/", {"user_id": self.user.id})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"ok": True})
        mock_send_push_to_user.assert_called_once()
