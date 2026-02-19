from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CarViewSet,
    EnquiryViewSet,
    SaleViewSet,
    TestimonialViewSet,
    register_user,
    current_user,
    check_admin,
    set_admin,
    send_otp,
    verify_otp_enquiry,
    login_user,
)

router = DefaultRouter()
router.register(r'cars', CarViewSet, basename='cars')
router.register(r'enquiries', EnquiryViewSet, basename='enquiries')
router.register(r'sales', SaleViewSet, basename='sales')
router.register(r'testimonials', TestimonialViewSet, basename='testimonials')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', login_user, name='token_obtain_pair'),
    path('auth/register/', register_user, name='auth-register'),
    path('auth/me/', current_user, name='auth-me'),
    path('check-admin/', check_admin, name='check-admin'),
    path('set-admin/', set_admin, name='set-admin'),
    path('send-otp/', send_otp, name='send-otp'),
    path('verify-otp-enquiry/', verify_otp_enquiry, name='verify-otp-enquiry'),
]
