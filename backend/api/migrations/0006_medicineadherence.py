from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0005_pushsubscription_and_last_notified"),
    ]

    operations = [
        migrations.CreateModel(
            name="MedicineAdherence",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("date", models.DateField()),
                ("taken_at", models.DateTimeField(auto_now_add=True)),
                (
                    "medicine",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="adherence_logs",
                        to="api.medicine",
                    ),
                ),
            ],
            options={
                "ordering": ["date", "id"],
            },
        ),
        migrations.AddConstraint(
            model_name="medicineadherence",
            constraint=models.UniqueConstraint(
                fields=("medicine", "date"),
                name="unique_medicine_adherence_per_day",
            ),
        ),
    ]
