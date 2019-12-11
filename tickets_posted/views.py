from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import (
	ListView, 
	DetailView, 
	CreateView,
	UpdateView,
	DeleteView
)
from .models import Ticket


# def home(request):
# 	posts = Ticket.objects.all()
# 	return render(request, 'tickets_posted/home.html', {"posts":posts})


class TicketListView(ListView):
	model = Ticket 
	template_name = 'tickets_posted/home.html' #<app name>/<model name>_<view type>.html
	context_object_name = 'posts'# This is the naming convention followed by django for object being passed in template from view
	ordering = ['-date_posted'] # - sign is used to reverse the ordering
	paginate_by = 5

class UserTicketListView(ListView):
	model = Ticket 
	template_name = 'tickets_posted/user_tickets.html' #<app name>/<model name>_<view type>.html
	context_object_name = 'posts'# This is the naming convention followed by django for object being passed in template from view
	paginate_by = 5

	def get_queryset(self):
		user = get_object_or_404(User, username=self.kwargs.get('username'))
		return Ticket.objects.filter(author=user).order_by('-date_posted')

class TicketDetailView(DetailView):# Here many variables are not needed as we are following django conventions for naming the template and object names
	model = Ticket 

class TicketCreateView(LoginRequiredMixin, CreateView):
	model = Ticket 
	fields = ['title', 'content']

	def form_valid(self, form):
		form.instance.author = self.request.user
		return super().form_valid(form)

class TicketUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
	model = Ticket 
	fields = ['title', 'content']

	def form_valid(self, form):
		form.instance.author = self.request.user
		return super().form_valid(form)

	# prevent updating other people post
	def test_func(self):
		ticket = self.get_object()
		if ticket.author == self.request.user:
			return True
		return False

class TicketDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):# Here many variables are not needed as we are following django conventions for naming the template and object names
	model = Ticket 
	success_url = '/'

	# prevent deleting other people post
	def test_func(self):
		ticket = self.get_object()
		if ticket.author == self.request.user:
			return True
		return False

def about(request):
	return render(request, 'tickets_posted/about.html')