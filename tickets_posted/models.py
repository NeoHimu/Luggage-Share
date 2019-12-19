from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.urls import reverse

# Create your models here.
class Ticket(models.Model):
	arrival_airport = models.CharField(max_length=100)
	flight_number = models.CharField(max_length=10)
	date = models.DateTimeField(default=timezone.now)
	time = models.TimeField()
	is_giver = models.CharField(max_length=20)
	extras = models.TextField()
	date_posted = models.DateTimeField(default=timezone.now)
	author = models.ForeignKey(User, on_delete=models.CASCADE)

	def __str__(self):
		return self.arrival_airport

	def get_absolute_url(self):
		return reverse('ticket-detail', kwargs = {'pk': self.pk})


class Airport(models.Model):
	name = models.CharField(max_length=100)
	code = models.CharField(max_length=20)
	city = models.CharField(max_length=20)

	def __str__(self):
		return self.name


