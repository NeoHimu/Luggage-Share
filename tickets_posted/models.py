from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.urls import reverse
from django.forms import ModelForm
from django.core.validators import FileExtensionValidator	
import os, subprocess
from django.db.models.signals import post_save

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
	ticket_pdf = models.FileField(upload_to="documents/%Y/%m/%d/", validators=[FileExtensionValidator(['pdf'])])
	upload_date = models.DateTimeField(auto_now_add =True)
	owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True)

# FileUpload form class.
class UploadForm(ModelForm):
	class Meta:
		model = Upload
		fields = ('ticket_pdf',)

	def customSave(self, user):
		lv = self.save(commit=False)
		lv.owner = user
		lv.save()
		return lv

class Message(models.Model):
	author = models.ForeignKey(User, related_name='author_messages', on_delete=models.CASCADE)
	# receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
	content = models.TextField()
	timestamp = models.DateTimeField(auto_now_add=True)
	room_name = models.TextField()

	def __str__(self):
		return self.author.username

	def last_10_messages(room_name):
		# need to be completed to load all the messages lazily
		return Message.objects.order_by('timestamp').filter(room_name=room_name)

def some_method(sender, instance, **kwargs):
	print("sender instance: "+instance.author.username)

post_save.connect(some_method, sender=Message)
