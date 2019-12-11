from django.urls import path
from .views import (
	TicketListView, 
	TicketDetailView, 
	TicketCreateView,
	TicketUpdateView,
	TicketDeleteView,
	UserTicketListView
)
from . import views

urlpatterns = [
	# path('', views.home, name='ticket-home'),	
	path('', TicketListView.as_view(), name='ticket-home'),	
	path('user/<str:username>/', UserTicketListView.as_view(), name='user-tickets'),	
	path('ticket/<int:pk>/', TicketDetailView.as_view(), name='ticket-detail'),	
	path('ticket/new/', TicketCreateView.as_view(), name='ticket-create'),	
	path('ticket/<int:pk>/update/', TicketUpdateView.as_view(), name='ticket-update'),
	path('ticket/<int:pk>/delete/', TicketDeleteView.as_view(), name='ticket-delete'),	
    path('about/', views.about, name='ticket-about'),	
]