"""
URL configuration for Eiiii project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

def health(_):
    return HttpResponse("ok")  # 200 OK

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/home/', include('home.urls')),
    path('api/search/', include('search.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/events/', include('category.urls')),
    path('api/details/', include('details.urls')),
    path('api/profile/', include('profiles.urls')),
    path('api/surveys/', include('surveys.urls')),
    path('api/points/', include('point.urls')),
    path("api/top3/", include("top3.urls")),
    path("api/chatbot/", include("chatbot.urls")),
    path("api/recommend/", include("recommend.urls")),
    path("api/pbrecommend/", include("pbrecommend.urls")),
    path("health", health),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)