from django.shortcuts import render, get_object_or_404, reverse, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.decorators import login_required
from django.views.generic import (
	ListView, 
	DetailView, 
	CreateView,
	UpdateView,
	DeleteView
)
import boto3
import botocore
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Ticket
from .models import Airport
from django.template.loader import render_to_string
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Upload, UploadForm
import os, subprocess
from django.utils.safestring import mark_safe
import json

def home(request):
    if(request.user.is_authenticated):
        all_tickets_submitted = Ticket.objects.filter(author=request.user).order_by('-date')
        page = request.GET.get('page', 1)
        paginator = Paginator(all_tickets_submitted, 5)
        try:
            all_tickets_list = paginator.page(page)
        except PageNotAnInteger:
            all_tickets_list = paginator.page(1)
        except EmptyPage:
            all_tickets_list = paginator.page(paginator.num_pages)
        return render(request, 'tickets_posted/base.html', {'posts':all_tickets_list, 'welcome_messsage':''})
    return render(request, 'tickets_posted/base.html', {'posts':'', 'welcome_messsage':'Welcome message!'})

def verify_me(request, pk):
    if request.method=="POST":
        #The max size in bytes
        MAX_SIZE = 10*1024*1024 #10 MB file size
        for filename, file in request.FILES.items():
            if request.FILES['ticket_pdf'].size > MAX_SIZE:
                request.FILES.pop(filename, None)
                messages.info(request, "file size exceeds the maximum size limit of 10MB")
                return HttpResponseRedirect(reverse('ticket-home'))

        ticket_pdf = UploadForm(request.POST, request.FILES) 
        if ticket_pdf.is_valid():
            #get the instance of currently saved ticket
            instance = ticket_pdf.customSave(request.user)
            t = Ticket.objects.get(id=pk)
            if(isValidPdfTicket(instance.ticket_pdf.url, t.departure_airport, t.arrival_airport)==True):
                # make is_verified=True
                t.is_verified = True
                t.save()
            else:
                messages.info(request, "Details in pdf do not match with the submitted ticket details :(")
            # needs to save the ticket to reflect the change
            return HttpResponseRedirect(reverse('ticket-home'))
    else:
        ticket_pdf=UploadForm()
    files = Upload.objects.all().order_by('-upload_date')
    return render(request, 'tickets_posted/ticket_upload_form.html', {'form':ticket_pdf, 'files':files})

    
def isValidPdfTicket(pdf_url, airport1, airport2):
    # print(pdf_url, airport1, airport2)
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    #url = "https://neohimu.s3.amazonaws.com/documents/2020/01/11/ticket_i1vZVS7.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIASF3WSTCZGT3EXWQD%2F20200111%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20200111T152521Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=8a82cab7598bb6d12008942fb8f01240c9ee999d2e52ae24e9d9d1ecefb3201d"

    KEY = '/'.join(pdf_url.split("?")[0].split('//')[1].split('/')[1:])
    #print(key)

    BUCKET_NAME = 'neohimu' #replace with your bucket name

    s3 = boto3.resource('s3')

    try:
        s3.Bucket(BUCKET_NAME).download_file(KEY, 'tickets_posted/my_local_ticket.pdf')
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == "404":
            print("The object does not exist.")
        else:
            raise 

    args = ["/usr/bin/pdftotext",
            '-enc',
            'UTF-8',
            "{}/my_local_ticket.pdf".format(SCRIPT_DIR),
            '-']
    res = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output = res.stdout.decode('utf-8')

    #print(output.split(" "))
    oo = [ ele.split("\n") for ele in output.split(" ")]
    temp = []

    for ele in oo:
        temp = temp+ele

    temp = [ele.lower() for ele in temp]

    #print(temp)

    #airport1 = "Hyderabad International Airport"
    #airport2 = "Hong Kong Airport"

    airport1 = airport1.split(" ")
    airport2 = airport2.split(" ")
    #print(airport1)
    #print(airport2)
    #remove empty string elements from the list
    airport1 = [a for a in airport1 if a is not '']
    airport2 = [a for a in airport2 if a is not '']
    #print(airport1[0])
    #print(airport2[0])

    if (airport1[0].lower() in temp) and (airport2[0].lower() in temp):
        return True
    else:
        return False


def load_demanded_users(request):
    if request.method=='POST':
        departure_airport = request.POST.get('departure_airport').strip(' ')
        arrival_airport = request.POST.get('arrival_airport').strip(' ')
        flight_number = request.POST.get('flight_number').strip(' ')
        date = request.POST.get('date')
        time = request.POST.get('time')
        is_giver = request.POST.get('is_giver')
        # print(departure_airport)
        dep = Airport.objects.get(name=departure_airport)
        arr = Airport.objects.get(name=arrival_airport)
        lat_dep = dep.lat;
        lng_dep = dep.lng;
        lat_arr = arr.lat;
        lng_arr = arr.lng;
        ticket_created = Ticket.objects.create(
            departure_airport=departure_airport,
            arrival_airport=arrival_airport,
            flight_number = flight_number,
            date = date,
            time = time,
            is_giver = is_giver,
            author = request.user,
            lat_dep = lat_dep,
            lng_dep = lng_dep,
            lat_arr = lat_arr,
            lng_arr = lng_arr
            )

        my_pickup_lat=ticket_created.lat_dep_user
        my_pickup_lng=ticket_created.lng_dep_user
        my_drop_lat=ticket_created.lat_arr_user
        my_drop_lng=ticket_created.lng_arr_user
  
        query_role='giver'
        if(is_giver=='giver'):
            query_role = 'taker'

        submitted_tickets = Ticket.objects.filter(departure_airport=departure_airport, arrival_airport=arrival_airport, flight_number=flight_number, date=date, is_giver=query_role).order_by('-date')
        
        html = render_to_string(
            template_name="tickets_posted/demanded_users.html", context={"submitted_tickets": submitted_tickets, "loggedInUser": request.user, "current_ticket_id":ticket_created.id, 
                "my_pickup_lat":my_pickup_lat, "my_pickup_lng":my_pickup_lng, "my_drop_lat":my_drop_lat, "my_drop_lng":my_drop_lng }
            )
        data_dict = {"html_from_view": html}
        return JsonResponse(data=data_dict, safe=False)

@login_required
def load_matched_users(request):
    if request.method=='GET':
        ticket_id = request.GET.get('ticket_id')
        temp_ticket = Ticket.objects.get(id=ticket_id)
        print(temp_ticket.departure_airport)
        print(temp_ticket.arrival_airport)
        print(temp_ticket.flight_number)
        print(temp_ticket.date)
        print(temp_ticket.time)
        print(temp_ticket.is_giver)
        query_role='giver'
        if(temp_ticket.is_giver=='giver'):
            query_role = 'taker'

        my_pickup_lat=temp_ticket.lat_dep_user
        my_pickup_lng=temp_ticket.lng_dep_user
        my_drop_lat=temp_ticket.lat_arr_user
        my_drop_lng=temp_ticket.lng_arr_user

        submitted_tickets = Ticket.objects.filter(departure_airport=temp_ticket.departure_airport, arrival_airport=temp_ticket.arrival_airport, flight_number=temp_ticket.flight_number, date=temp_ticket.date, is_giver=query_role).order_by('-date')
        
        print(submitted_tickets)

        html = render_to_string(
            template_name="tickets_posted/demanded_users.html", context={"submitted_tickets": submitted_tickets, "loggedInUser": request.user, "current_ticket_id":ticket_id,
                "my_pickup_lat":my_pickup_lat, "my_pickup_lng":my_pickup_lng, "my_drop_lat":my_drop_lat, "my_drop_lng":my_drop_lng}
            )
        data_dict = {"html_from_view": html}
        return JsonResponse(data=data_dict, safe=False)

@login_required
def update_location_departure(request):
    if request.method=='POST':

        my_pickup_lat = request.POST.get('my_pickup_lat')
        my_pickup_lng = request.POST.get('my_pickup_lng')
        current_ticket_id = request.POST.get('current_ticket_id')

        ticket_created = Ticket.objects.get(id=current_ticket_id)
        ticket_created.lat_dep_user = my_pickup_lat
        ticket_created.lng_dep_user = my_pickup_lng
        ticket_created.save()
        data_dict = {"html_from_view": "success departure"}
        return JsonResponse(data=data_dict, safe=False)

@login_required
def update_location_arrival(request):
    if request.method=='POST':
        my_drop_lat = request.POST.get('my_drop_lat')
        my_drop_lng = request.POST.get('my_drop_lng')
        current_ticket_id = request.POST.get('current_ticket_id')
        # print("current ticket: ",current_ticket_id)
        ticket_created = Ticket.objects.get(id=current_ticket_id)
        ticket_created.lat_arr_user = my_drop_lat
        ticket_created.lng_arr_user = my_drop_lng
        ticket_created.save()
        data_dict = {"html_from_view": "success arrival"}
        return JsonResponse(data=data_dict, safe=False)

@login_required
def get_neighbours(request):
    if request.method == 'GET':
        current_ticket_id = request.GET.get('current_ticket_id').strip()
        current_ticket = Ticket.objects.get(id=current_ticket_id)
        departure_airport = current_ticket.departure_airport
        arrival_airport = current_ticket.arrival_airport

        all_neighbours_departure = Ticket.objects.filter(departure_airport=departure_airport).values('lat_dep_user', 'lng_dep_user', 'author')
        all_neighbours_departure = [ {'lat_dep_user':obj['lat_dep_user'], 'lng_dep_user':obj['lng_dep_user'], 'author':User.objects.get(id=obj['author']).username} for obj in list(all_neighbours_departure)]
        all_neighbours_arrival = Ticket.objects.filter(arrival_airport=arrival_airport).values('lat_arr_user', 'lng_arr_user', 'author')
        all_neighbours_arrival = [ {'lat_arr_user':obj['lat_arr_user'], 'lng_arr_user':obj['lng_arr_user'], 'author':User.objects.get(id=obj['author']).username} for obj in list(all_neighbours_arrival)]
        data_dict ={'all_neighbours_departure':all_neighbours_departure, 'all_neighbours_arrival':all_neighbours_arrival}
        return JsonResponse(data=data_dict, safe=False)


# @login_required
# def userhomepage(request):
#     return redirect(home)


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

def load_airports_departure(request):
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
            template_name="tickets_posted/departure-airport-partial.html", context={"airports": airports if len(airports)<=5 else airports[:5]}
        )
        data_dict = {"html_from_view": html}
        return JsonResponse(data=data_dict, safe=False)

def load_airports_arrival(request):
    ctx = {}
    url_parameter = request.GET.get("q")

    if url_parameter:
        airports_1 = Airport.objects.filter(name__icontains=url_parameter)
        airports_2 = Airport.objects.filter(city__icontains=url_parameter)
        airports_3 = Airport.objects.filter(code__icontains=url_parameter)
        airports = airports_1 | airports_2 | airports_3       
    else:
        airports = {}#= Airport.objects.all()

    ctx["airports"] = airports
    if request.is_ajax():

        html = render_to_string(
            template_name="tickets_posted/arrival-airport-partial.html", context={"airports": airports if len(airports)<=5 else airports[:5]} #send only 5 results
        )
        data_dict = {"html_from_view": html}
        return JsonResponse(data=data_dict, safe=False)


def index(request):
    return render(request, 'chat/index.html', {})

@login_required
def room(request, room_name):
    return render(request, 'chat/room.html', {
        'room_name_json': mark_safe(json.dumps(room_name)),
        'username': mark_safe(json.dumps(request.user.username)),
    }) 