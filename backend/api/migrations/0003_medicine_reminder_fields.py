import datetime

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_user_name"),
    ]

    operations = [
        migrations.AddField(
            model_name="medicine",
            name="created_at",
            field=models.DateTimeField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="medicine",
            name="date",
            field=models.DateField(default=datetime.date(2026, 3, 21)),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="medicine",
            name="dosage",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="medicine",
            name="frequency",
            field=models.CharField(default="daily", max_length=30),
        ),
        migrations.AddField(
            model_name="medicine",
            name="notes",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="medicine",
            name="taken",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="medicine",
            name="time",
            field=models.CharField(max_length=8),
        ),
        migrations.RemoveField(
            model_name="medicine",
            name="status",
        ),
    ]
