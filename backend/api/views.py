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