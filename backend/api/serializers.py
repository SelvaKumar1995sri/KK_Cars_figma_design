from rest_framework import serializers
from .models import Car, Enquiry, Sale, Testimonial, CarImage


class CarImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = CarImage
        fields = ['id', 'image', 'image_url', 'created_at']

    def get_image_url(self, obj):
        try:
            if obj.image and hasattr(obj.image, 'url'):
                return obj.image.url
        except Exception:
            pass
        return None


class CarSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    image_url = serializers.SerializerMethodField()
    additional_images = CarImageSerializer(many=True, read_only=True)

    class Meta:
        model = Car
        fields = '__all__'

    def get_image_url(self, obj):
        try:
            if obj.image and hasattr(obj.image, 'url'):
                return obj.image.url
        except Exception:
            pass
        return obj.image_url

class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = '__all__'

class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'
