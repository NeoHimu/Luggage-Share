from django.shortcuts import render, get_object_or_404, reverse, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.models import User
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.decorators import login_required
from django.views.generic import (
	ListView, 
	DetailView, 
	CreateView,
	UpdateView,
	DeleteView
)
from .models import Ticket
from .models import Airport
from django.template.loader import render_to_string
from django.http import JsonResponse

def home(request):
    posts = Ticket.objects.all()
    return render(request, 'tickets_posted/base.html', {"posts":posts})


def load_demanded_users(request):
    if request.method=='POST':
        arrival_airport = request.POST.get('arrival_airport')
        flight_number = request.POST.get('flight_number')
        date = request.POST.get('date')
        time = request.POST.get('time')
        is_giver = request.POST.get('is_giver')
        Ticket.objects.create(
            arrival_airport=arrival_airport,
            flight_number = flight_number,
            date = date,
            time = time,
            is_giver = is_giver,
            author = request.user
            )
  
        query_role='giver'
        if(is_giver=='giver'):
            query_role = 'taker'

        submitted_tickets = Ticket.objects.filter(arrival_airport=arrival_airport, flight_number=flight_number, date=date, time=time, is_giver=query_role)
        

        html = render_to_string(
            template_name="tickets_posted/demanded_users.html", context={"submitted_tickets": submitted_tickets}
            )
        data_dict = {"html_from_view": html}
        return JsonResponse(data=data_dict, safe=False)

@login_required
def user_submitted_tickets(request):
    all_tickets_submitted = Ticket.objects.filter(author=request.user)
    return render(request, 'tickets_posted/home.html', {'posts':all_tickets_submitted})

@login_required
def userhomepage(request):
    return redirect(user_submitted_tickets)


# def hello(request):
# 	return render(request, 'tickets_posted/home.html')

# class TicketListView(ListView):
# 	model = Ticket 
# 	template_name = 'tickets_posted/home.html' #<app name>/<model name>_<view type>.html
# 	context_object_name = 'posts'# This is the naming convention followed by django for object being passed in template from view
# 	ordering = ['-date_posted'] # - sign is used to reverse the ordering
# 	paginate_by = 5

# class UserTicketListView(ListView):
# 	model = Ticket 
# 	template_name = 'tickets_posted/user_tickets.html' #<app name>/<model name>_<view type>.html
# 	context_object_name = 'posts'# This is the naming convention followed by django for object being passed in template from view
# 	paginate_by = 5

# 	def get_queryset(self):
# 		user = get_object_or_404(User, username=self.kwargs.get('username'))
# 		return Ticket.objects.filter(author=user).order_by('-date_posted')

# class TicketDetailView(DetailView):# Here many variables are not needed as we are following django conventions for naming the template and object names
# 	model = Ticket 

# class TicketCreateView(LoginRequiredMixin, CreateView):
# 	model = Ticket 
# 	fields = ['arrival_airport', 'flight_number', 'date', 'time', 'is_giver', 'extras']

# 	def form_valid(self, form):
# 		form.instance.author = self.request.user
# 		return super().form_valid(form)

# class TicketUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
# 	model = Ticket 
# 	fields = ['arrival_airport', 'flight_number', 'date', 'time', 'is_giver', 'extras']

# 	def form_valid(self, form):
# 		form.instance.author = self.request.user
# 		return super().form_valid(form)

# 	# prevent updating other people post
# 	def test_func(self):
# 		ticket = self.get_object()
# 		if ticket.author == self.request.user:
# 			return True
# 		return False

# class TicketDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):# Here many variables are not needed as we are following django conventions for naming the template and object names
# 	model = Ticket 
# 	success_url = '/'

# 	# prevent deleting other people post
# 	def test_func(self):
# 		ticket = self.get_object()
# 		if ticket.author == self.request.user:
# 			return True
# 		return False

def about(request):
	return render(request, 'tickets_posted/about.html')


# def load_airports_departure(request):
#     ctx = {}
#     url_parameter = request.GET.get("q")

#     if url_parameter:
#         airports_1 = Airport.objects.filter(name__icontains=url_parameter)
#         airports_2 = Airport.objects.filter(city__icontains=url_parameter)
#         airports = airports_1 | airports_2        
#     else:
#         airports = {}#= Airport.objects.all()

#     ctx["airports"] = airports
#     if request.is_ajax():

#         html = render_to_string(
#             template_name="tickets_posted/departure-airport-partial.html", context={"airports": airports}
#         )
#         data_dict = {"html_from_view": html}
#         return JsonResponse(data=data_dict, safe=False)


def load_airports_arrival(request):
    ctx = {}
    url_parameter = request.GET.get("q")

    if url_parameter:
        airports_1 = Airport.objects.filter(name__icontains=url_parameter)
        airports_2 = Airport.objects.filter(city__icontains=url_parameter)
        airports = airports_1 | airports_2        
    else:
        airports = {}#= Airport.objects.all()

    ctx["airports"] = airports
    if request.is_ajax():

        html = render_to_string(
            template_name="tickets_posted/arrival-airport-partial.html", context={"airports": airports}
        )
        data_dict = {"html_from_view": html}
        return JsonResponse(data=data_dict, safe=False)

