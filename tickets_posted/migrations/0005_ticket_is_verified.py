# Generated by Django 3.0 on 2020-01-09 18:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tickets_posted', '0004_remove_ticket_ticket_pdf'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticket',
            name='is_verified',
            field=models.BooleanField(default=False),
        ),
    ]