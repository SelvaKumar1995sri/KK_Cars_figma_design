import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { API } from "../utils/apiConfig";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Car, Gauge, Fuel, Calendar, Star, ArrowRight, Shield, Award, TrendingUp } from "lucide-react";
import { motion } from "motion/react";


interface CarData {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: string;
  fuelType: string;
  imageUrl: string;
  condition: string;
}

interface Testimonial {
  id: string;
  customerName: string;
  carPurchased: string;
  rating: number;
  feedback: string;
  imageUrl: string;
  purchaseDate: string;
}

export default function Home() {
  const [cars, setCars] = useState<CarData[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCars();
    loadTestimonials();
  }, []);

  const loadCars = async () => {
    try {
      const response = await fetch(`${API}/cars`);
      const data = await response.json();
      setCars(data || []);
    } catch (error) {
      console.error("Error loading cars:", error);
    }
  };

  const loadTestimonials = async () => {
    try {
      const response = await fetch(`${API}/testimonials`);
      const data = await response.json();
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error loading testimonials:", error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1632081831947-24ffdea2cd04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpJTIwY2FyJTIwZGVhbGVyc2hpcHxlbnwxfHx8fDE3NzA5NjY4ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Car Showroom"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Buy & Sell
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                All Car Brands
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Quality selection of vehicles from all brands. 
              Your trusted partner for buying and selling cars.
            </p>
            <div className="flex gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8"
                onClick={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse Inventory
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link to="/contact">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white px-8"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Certified Quality</h3>
              <p className="text-gray-400">Every vehicle undergoes rigorous inspection and certification</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Best Prices</h3>
              <p className="text-gray-400">Competitive pricing with flexible financing options</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Expert Support</h3>
              <p className="text-gray-400">Professional guidance throughout your buying journey</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Inventory Section */}
      <section id="inventory" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Featured Vehicles
            </h2>
            <p className="text-gray-400 text-lg">
              Browse our collection of quality vehicles
            </p>
          </motion.div>

          {cars.length === 0 ? (
            <div className="text-center py-20">
              <Car className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">No Vehicles Available</h3>
              <p className="text-gray-400">Check back soon for new arrivals!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700 hover:border-orange-600/50 transition-all duration-300 overflow-hidden group cursor-pointer">
                    <div className="relative h-56 overflow-hidden">
                      <ImageWithFallback
                        src={car.imageUrl}
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0">
                          {car.condition}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-white text-xl">{car.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {car.brand} {car.model} • {car.year}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Gauge className="h-4 w-4 text-orange-400" />
                          <span>{car.mileage}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Fuel className="h-4 w-4 text-orange-400" />
                          <span>{car.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="h-4 w-4 text-orange-400" />
                          <span>{car.year}</span>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                        ${car.price.toLocaleString()}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => navigate(`/car/${car.id}`)}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-slate-800/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Happy Customers
              </h2>
              <p className="text-gray-400 text-lg">
                See what our satisfied customers have to say
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700 h-full">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <ImageWithFallback
                          src={testimonial.imageUrl}
                          alt={testimonial.customerName}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg">
                            {testimonial.customerName}
                          </CardTitle>
                          <CardDescription className="text-gray-400 text-sm">
                            {testimonial.carPurchased}
                          </CardDescription>
                          <div className="flex gap-1 mt-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < testimonial.rating
                                    ? "fill-orange-400 text-orange-400"
                                    : "text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 italic">
                        "{testimonial.feedback}"
                      </p>
                      <p className="text-gray-500 text-sm mt-4">
                        Purchased: {new Date(testimonial.purchaseDate).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-12 text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Find Your Perfect Car?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who found their dream vehicle with Sri kk cars.
              Contact us today!
            </p>
            <Link to="/contact">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 px-8"
              >
                Contact Us Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}