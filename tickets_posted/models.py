from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.urls import reverse
from django.forms import ModelForm

# Create your models here.
class Ticket(models.Model):
	departure_airport = models.CharField(max_length=100)
	arrival_airport = models.CharField(max_length=100)
	flight_number = models.CharField(max_length=10)
	date = models.DateTimeField(default=timezone.now)
	time = models.TimeField()
	is_giver = models.CharField(max_length=20)
	extras = models.TextField()
	date_posted = models.DateTimeField(default=timezone.now)
	author = models.ForeignKey(User, on_delete=models.CASCADE)
	is_verified = models.BooleanField(default=False)

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



class Upload(models.Model):
	ticket_pdf = models.FileField(upload_to="documents/%Y/%m/%d/")
	upload_date=models.DateTimeField(auto_now_add =True)

# FileUpload form class.
class UploadForm(ModelForm):
	class Meta:
		model = Upload
		fields = ('ticket_pdf',)

