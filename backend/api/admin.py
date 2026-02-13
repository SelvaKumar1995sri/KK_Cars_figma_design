from django.contrib import admin
from .models import Car, Enquiry, Sale, Testimonial

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('id', 'brand', 'name', 'year', 'price')
    search_fields = ('name', 'brand', 'model')

@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'car_name', 'status', 'created_at')
    search_fields = ('full_name', 'phone_number', 'car_name')

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'car_name', 'sale_price', 'sale_date')

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'car_purchased', 'rating')
