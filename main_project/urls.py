from django.contrib import admin
from django.urls import path, include
from users import views as user_views 
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from tickets_posted import views as tickets_posted_views


urlpatterns = [
	path('', include('tickets_posted.urls')),
	path('^verify-me/(?P<pk>\d+)/$', tickets_posted_views.verify_me, name='verify_me'),
	path('register/', user_views.register, name='register'),
	path('profile/', user_views.profile, name='profile'),
	path('login/', auth_views.LoginView.as_view(template_name='users/login.html'), name='login'),
	path('logout/', auth_views.LogoutView.as_view(template_name='users/logout.html'), name='logout'),
	path('password-reset/', auth_views.PasswordResetView.as_view(template_name='users/password_reset.html'), name='password_reset'),
	path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(template_name='users/password_reset_done.html'), name='password_reset_done'),
	path('password-reset-confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='users/password_reset_confirm.html'), name='password_reset_confirm'),
	path('password-reset-complete/', auth_views.PasswordResetCompleteView.as_view(template_name='users/password_reset_complete.html'), name='password_reset_complete'),    
    path('admin/', admin.site.urls),
    path('^activate/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$', user_views.activate, name='activate'),

    path("airports_departure/", tickets_posted_views.load_airports_departure, name="airports_departure"),
    path("airports_arrival/", tickets_posted_views.load_airports_arrival, name="airports_arrival"),
    path("create/new/ticket/", tickets_posted_views.load_demanded_users, name="demanded_users"),
    path("find-all-matched-users/", tickets_posted_views.load_matched_users, name="matched_users"),
    # path("ticket-info-submitted/", tickets_posted_views.hello, name="ticket_info_submitted"),
]

if settings.DEBUG:
	urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



