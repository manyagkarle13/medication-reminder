from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0004_alter_medicine_options_alter_medicine_created_at_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="medicine",
            name="last_notified_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name="PushSubscription",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("endpoint", models.TextField(unique=True)),
                ("p256dh", models.TextField()),
                ("auth", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="push_subscriptions", to="api.user")),
            ],
            options={"ordering": ["-id"]},
        ),
    ]
