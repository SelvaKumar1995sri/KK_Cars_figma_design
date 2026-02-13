from rest_framework import viewsets, permissions
from .models import Car, Enquiry, Sale, Testimonial
from .serializers import CarSerializer, EnquirySerializer, SaleSerializer, TestimonialSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

# Simple in-memory OTP store for demo
OTP_STORE = {}

UserModel = get_user_model()

class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all().order_by('-created_at')
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class EnquiryViewSet(viewsets.ModelViewSet):
    queryset = Enquiry.objects.all().order_by('-created_at')
    serializer_class = EnquirySerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['put'], permission_classes=[permissions.IsAuthenticated])
    def update_status(self, request, pk=None):
        enquiry = self.get_object()
        status_value = request.data.get('status')
        if status_value:
            enquiry.status = status_value
            enquiry.save()
            return Response({'status': 'updated'})
        return Response({'error': 'status required'}, status=status.HTTP_400_BAD_REQUEST)

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().order_by('-created_at')
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all().order_by('-created_at')
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    if not email or not password:
        return Response({'error': 'email and password required'}, status=status.HTTP_400_BAD_REQUEST)
    if UserModel.objects.filter(email=email).exists():
        return Response({'error': 'user already exists'}, status=status.HTTP_400_BAD_REQUEST)
    user = UserModel.objects.create(
        username=email,
        email=email,
        password=make_password(password),
        is_active=True,
    )
    try:
        user.first_name = name or ''
        user.save()
    except Exception:
        pass

    refresh = RefreshToken.for_user(user)
    return Response({
        'user': {'id': user.id, 'email': user.email, 'name': user.first_name},
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_admin(request):
    user = request.user
    return Response({'isAdmin': bool(user.is_staff)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({'id': user.id, 'email': user.email, 'name': getattr(user, 'first_name', '')})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_admin(request):
    user = request.user
    user.is_staff = True
    user.save()
    return Response({'ok': True})


@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    phone = request.data.get('phoneNumber')
    if not phone:
        return Response({'error': 'phoneNumber required'}, status=status.HTTP_400_BAD_REQUEST)
    otp = str(100000 + (int(timezone.now().timestamp()) % 900000))
    OTP_STORE[phone] = {'otp': otp, 'ts': timezone.now().timestamp()}
    print(f"OTP for {phone}: {otp}")
    return Response({'success': True})


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_enquiry(request):
    phone = request.data.get('phoneNumber')
    otp = request.data.get('otp')
    full_name = request.data.get('fullName')
    car_id = request.data.get('carId')
    car_name = request.data.get('carName')
    message = request.data.get('message')
    record = OTP_STORE.get(phone)
    if not record or record.get('otp') != otp:
        return Response({'error': 'invalid otp'}, status=status.HTTP_400_BAD_REQUEST)
    enquiry = Enquiry.objects.create(
        car=None,
        car_name=car_name or '',
        full_name=full_name or '',
        phone_number=phone,
        message=message or '',
        status='pending'
    )
    try:
        del OTP_STORE[phone]
    except Exception:
        pass
    return Response({'ok': True, 'enquiryId': enquiry.id})
