# Generated by Django 3.0 on 2020-02-15 08:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tickets_posted', '0002_auto_20200213_1925'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticket',
            name='lat_arr_user',
            field=models.FloatField(default=0.1),
        ),
        migrations.AddField(
            model_name='ticket',
            name='lat_dep_user',
            field=models.FloatField(default=0.1),
        ),
        migrations.AddField(
            model_name='ticket',
            name='lng_arr_user',
            field=models.FloatField(default=0.1),
        ),
        migrations.AddField(
            model_name='ticket',
            name='lng_dep_user',
            field=models.FloatField(default=0.1),
        ),
    ]
