from django.db import models
from django.conf import settings

class Car(models.Model):
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100, blank=True)
    year = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    mileage = models.CharField(max_length=100, blank=True)
    fuel_type = models.CharField(max_length=50, blank=True)
    image_url = models.URLField(blank=True)
    condition = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    transmission = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=50, blank=True)
    image = models.ImageField(upload_to='cars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.brand} {self.name} ({self.year})"

class Enquiry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    car = models.ForeignKey(Car, on_delete=models.SET_NULL, null=True, blank=True)
    car_name = models.CharField(max_length=200)
    full_name = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=50)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=50, default='pending')
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Enquiry from {self.full_name} for {self.car_name}"

class Sale(models.Model):
    car = models.ForeignKey(Car, on_delete=models.SET_NULL, null=True, blank=True)
    car_brand = models.CharField(max_length=100, blank=True)
    car_name = models.CharField(max_length=200, blank=True)
    sale_price = models.DecimalField(max_digits=12, decimal_places=2)
    profit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    customer_name = models.CharField(max_length=200, blank=True)
    sale_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sale: {self.car_name} ({self.sale_date})"

class Testimonial(models.Model):
    customer_name = models.CharField(max_length=200)
    car_purchased = models.CharField(max_length=200, blank=True)
    rating = models.PositiveSmallIntegerField(default=5)
    feedback = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer_name} - {self.car_purchased}"