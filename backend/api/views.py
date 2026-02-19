from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Car, Enquiry, Sale, Testimonial, CarImage
from .serializers import CarSerializer, EnquirySerializer, SaleSerializer, TestimonialSerializer, CarImageSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import serializers as drf_serializers
from django.utils import timezone
import os
import requests

from twilio.rest import Client as TwilioClient

# ── MUST be declared before any class that uses it ──
UserModel = get_user_model()

# Simple in-memory OTP store for demo
OTP_STORE = {}


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email') or attrs.get('username', '')
        password = attrs.get('password', '')

        if not email or not password:
            raise drf_serializers.ValidationError('Email and password are required.')

        try:
            user = UserModel.objects.get(email=email)
        except UserModel.DoesNotExist:
            raise drf_serializers.ValidationError('No account found with this email.')

        if not user.check_password(password):
            raise drf_serializers.ValidationError('Incorrect password.')

        if not user.is_active:
            raise drf_serializers.ValidationError('User account is disabled.')

        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all().order_by('-created_at')
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def perform_destroy(self, instance):
        try:
            if instance.image:
                instance.image.delete(save=False)
            for car_image in instance.additional_images.all():
                car_image.image.delete(save=False)
                car_image.delete()
        except Exception:
            pass
        instance.delete()

    def perform_update(self, serializer):
        instance = self.get_object()
        old_image = instance.image
        new_image = self.request.FILES.get('image')
        serializer.save()
        try:
            if new_image and old_image and old_image.name != serializer.instance.image.name:
                old_image.delete(save=False)
        except Exception:
            pass

    def create(self, request, *args, **kwargs):
        additional_images = request.FILES.getlist('additional_images')
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        car = serializer.save()
        for image_file in additional_images:
            CarImage.objects.create(car=car, image=image_file)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        additional_images = request.FILES.getlist('additional_images')
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        car = serializer.save()
        if additional_images:
            car.additional_images.all().delete()
            for image_file in additional_images:
                CarImage.objects.create(car=car, image=image_file)
        return Response(serializer.data)


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

    # Normalise to 10-digit Indian number
    phone_digits = ''.join(filter(str.isdigit, phone))
    if phone_digits.startswith('91') and len(phone_digits) == 12:
        phone_digits = phone_digits[2:]
    if len(phone_digits) != 10:
        return Response({'error': 'Invalid phone number. Must be 10 digits.'}, status=status.HTTP_400_BAD_REQUEST)

    store_key = '+91' + phone_digits
    otp = str(100000 + (int(timezone.now().timestamp()) % 900000))
    OTP_STORE[store_key] = {'otp': otp, 'ts': timezone.now().timestamp()}

    print(f"OTP for {store_key}: {otp}")

    # ── Twilio ────────────────────────────────────────────────────────────
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token  = os.environ.get('TWILIO_AUTH_TOKEN')
    from_number = os.environ.get('TWILIO_FROM')

    print(f"SID: '{account_sid}'")
    print(f"TOKEN length: {len(auth_token) if auth_token else 0}")
    print(f"FROM: '{from_number}'")

    if not all([account_sid, auth_token, from_number]):
        return Response(
            {'error': 'SMS service not configured. Set TWILIO_* vars in .env'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        client = TwilioClient(account_sid, auth_token)
        msg = client.messages.create(
            body=f'Your KK Cars OTP is: {otp}. Valid for 5 minutes. Do not share.',
            from_=from_number,
            to=store_key,           # e.g. +918015569162
        )
        print(f"Twilio message SID: {msg.sid}, status: {msg.status}")

    except Exception as e:
        print(f"Twilio error: {e}")
        return Response({'error': f'Failed to send OTP: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'success': True})

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_enquiry(request):
    phone    = request.data.get('phoneNumber', '')
    otp      = request.data.get('otp', '')
    full_name = request.data.get('fullName', '')
    car_name  = request.data.get('carName', '')
    message   = request.data.get('message', '')

    # Normalise to same key format used in send_otp
    phone_digits = ''.join(filter(str.isdigit, phone))
    if phone_digits.startswith('91') and len(phone_digits) == 12:
        phone_digits = phone_digits[2:]
    if len(phone_digits) != 10:
        return Response({'error': 'Invalid phone number format'}, status=status.HTTP_400_BAD_REQUEST)

    store_key = '+91' + phone_digits
    record = OTP_STORE.get(store_key)

    if not record:
        return Response({'error': 'OTP not found or expired. Request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

    # Optional: expire OTP after 5 minutes
    if timezone.now().timestamp() - record['ts'] > 300:
        OTP_STORE.pop(store_key, None)
        return Response({'error': 'OTP expired. Request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

    if record.get('otp') != otp:
        return Response({'error': 'Invalid OTP. Please check and try again.'}, status=status.HTTP_400_BAD_REQUEST)

    enquiry = Enquiry.objects.create(
        car=None,
        car_name=car_name,
        full_name=full_name,
        phone_number=store_key,
        message=message,
        status='pending',
    )

    OTP_STORE.pop(store_key, None)
    return Response({'ok': True, 'enquiryId': enquiry.id})


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if not email or not password:
        return Response(
            {'detail': 'Email and password are required.'},  # changed key to 'detail'
            status=status.HTTP_400_BAD_REQUEST
        )
    try:
        user = UserModel.objects.get(email=email)
    except UserModel.DoesNotExist:
        return Response(
            {'detail': 'No account found with this email.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if not user.check_password(password):
        return Response(
            {'detail': 'Incorrect password.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if not user.is_active:
        return Response(
            {'detail': 'User account is disabled.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })