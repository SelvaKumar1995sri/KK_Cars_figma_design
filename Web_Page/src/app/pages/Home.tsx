import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { API } from "../utils/apiConfig";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Car, Gauge, Fuel, Calendar, Star, ArrowRight, Shield, Award, TrendingUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
  image: string;
  purchaseDate: string;
}

export default function Home() {
  const [cars, setCars] = useState<CarData[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const navigate = useNavigate();
  const [isAdminLocal, setIsAdminLocal] = useState(false);
  const [newCarOpen, setNewCarOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editCarOpen, setEditCarOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingCar, setEditingCar] = useState<any | null>(null);
  const [newCar, setNewCar] = useState({
    name: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    mileage: "",
    fuelType: "Petrol",
    imageFile: null as File | null,
    condition: "Used",
  });

  useEffect(() => {
    loadCars();
    loadTestimonials();
    (async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const res = await fetch(`${API}/check-admin/`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const d = await res.json();
          setIsAdminLocal(!!d.isAdmin);
        }
      } catch (err) {
        console.error('Error checking admin status', err);
      }
    })();

    const onAdminChanged = (e: any) => setIsAdminLocal(!!e.detail);
    window.addEventListener('adminChanged', onAdminChanged as EventListener);
    return () => window.removeEventListener('adminChanged', onAdminChanged as EventListener);
  }, []);

  const loadCars = async () => {
    try {
      const response = await fetch(`${API}/cars/`);
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

  const handleAddCar = async () => {
    setAdding(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please sign in as admin to add cars');
        setAdding(false);
        return;
      }

      const form = new FormData();
      form.append('name', newCar.name);
      form.append('brand', newCar.brand);
      form.append('model', newCar.model);
      form.append('year', String(newCar.year));
      form.append('price', String(newCar.price));
      form.append('mileage', newCar.mileage || '');
      form.append('fuel_type', newCar.fuelType || '');
      form.append('condition', newCar.condition || 'Used');
      if (newCar.imageFile) form.append('image', newCar.imageFile);

      const response = await fetch(`${API}/cars/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (response.ok) {
        toast.success('Car added successfully');
        setNewCar({ name: '', brand: '', model: '', year: new Date().getFullYear(), price: 0, mileage: '', fuelType: 'Petrol', imageFile: null, condition: 'Used' });
        setNewCarOpen(false);
        await loadCars();
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to add car');
      }
    } catch (err) {
      console.error('Error adding car', err);
      toast.error('Failed to add car');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please sign in as admin to delete cars');
        return;
      }
      const res = await fetch(`${API}/cars/${carId}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        toast.success('Car deleted');
        await loadCars();
      } else {
        toast.error('Failed to delete car');
      }
    } catch (err) {
      console.error('Error deleting car', err);
      toast.error('Failed to delete car');
    }
  };

  const openEditDialog = (car: any) => {
    setEditingCar({ ...car });
    setEditCarOpen(true);
  };

  const handleEditCar = async () => {
    if (!editingCar) return;
    setEditing(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { toast.error('Please sign in as admin to edit cars'); setEditing(false); return; }
      let res;
      if (editingCar.imageFile) {
        const form = new FormData();
        form.append('name', editingCar.name || '');
        form.append('brand', editingCar.brand || '');
        form.append('model', editingCar.model || '');
        form.append('year', String(editingCar.year || ''));
        form.append('price', String(editingCar.price || 0));
        form.append('mileage', editingCar.mileage || '');
        form.append('fuel_type', editingCar.fuelType || '');
        form.append('condition', editingCar.condition || 'Used');
        form.append('image', editingCar.imageFile);
        res = await fetch(`${API}/cars/${editingCar.id}/`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
      } else {
        res = await fetch(`${API}/cars/${editingCar.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(editingCar),
        });
      }
      if (res.ok) {
        toast.success('Car updated');
        setEditCarOpen(false);
        setEditingCar(null);
        await loadCars();
      } else {
        toast.error('Failed to update car');
      }
    } catch (err) {
      console.error('Error editing car', err);
      toast.error('Failed to update car');
    } finally {
      setEditing(false);
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

      

      {/* Inventory Section */}
      <section id="inventory" className="py-20">
        <div className="container mx-auto px-4">

          {/* Admin: Add Car Dialog trigger */}
          {isAdminLocal && (
            <div className="flex justify-end mb-6">
              <Dialog open={newCarOpen} onOpenChange={setNewCarOpen}>
                <DialogTrigger asChild>
                  {/* <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white">Add Car</Button> */}
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Car</DialogTitle>
                    <DialogDescription>Fill in the vehicle details</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <Input value={newCar.name} onChange={(e) => setNewCar({ ...newCar, name: e.target.value })} />
                    <Label>Brand</Label>
                    <Input value={newCar.brand} onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })} />
                    <Label>Model</Label>
                    <Input value={newCar.model} onChange={(e) => setNewCar({ ...newCar, model: e.target.value })} />
                    <Label>Year</Label>
                    <Input type="number" value={newCar.year} onChange={(e) => setNewCar({ ...newCar, year: Number(e.target.value) })} />
                    <Label>Price</Label>
                    <Input type="number" value={newCar.price} onChange={(e) => setNewCar({ ...newCar, price: Number(e.target.value) })} />
                    <Label>Image (upload)</Label>
                    <input type="file" accept="image/*" onChange={(e) => setNewCar({ ...newCar, imageFile: e.target.files ? e.target.files[0] : null })} />
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleAddCar} disabled={adding} className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                        {adding ? 'Adding...' : 'Add Car'}
                      </Button>
                      <Button variant="outline" onClick={() => setNewCarOpen(false)}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Admin: Edit Car Dialog */}
          {isAdminLocal && editingCar && (
            <Dialog open={editCarOpen} onOpenChange={setEditCarOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Car</DialogTitle>
                  <DialogDescription>Update vehicle details</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input value={editingCar?.name || ''} onChange={(e) => setEditingCar({ ...editingCar, name: e.target.value })} />
                  <Label>Brand</Label>
                  <Input value={editingCar?.brand || ''} onChange={(e) => setEditingCar({ ...editingCar, brand: e.target.value })} />
                  <Label>Model</Label>
                  <Input value={editingCar?.model || ''} onChange={(e) => setEditingCar({ ...editingCar, model: e.target.value })} />
                  <Label>Year</Label>
                  <Input type="number" value={editingCar?.year || ''} onChange={(e) => setEditingCar({ ...editingCar, year: Number(e.target.value) })} />
                  <Label>Price</Label>
                  <Input type="number" value={editingCar?.price || 0} onChange={(e) => setEditingCar({ ...editingCar, price: Number(e.target.value) })} />
                  <Label>Image (upload to replace)</Label>
                  <input type="file" accept="image/*" onChange={(e) => setEditingCar({ ...editingCar, imageFile: e.target.files ? e.target.files[0] : null })} />
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleEditCar} disabled={editing} className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                      {editing ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={() => { setEditCarOpen(false); setEditingCar(null); }}>Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Cars: Empty state OR Grid */}
          {cars.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-4xl font-bold text-white mb-4">Featured Vehicles</h2>
              <p className="text-gray-400 text-lg mb-8">Browse our collection of quality vehicles</p>
              <Car className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">No Vehicles Available</h3>
              <p className="text-gray-400">Check back soon for new arrivals!</p>
              {isAdminLocal && (
                <div className="mt-6">
                  <Button onClick={() => navigate('/admin')} className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                    Add Car
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
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
                          src={(car as any).image || (car as any).imageUrl}
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
                        <div className="w-full flex gap-2">
                          <Button
                            onClick={() => navigate(`/car/${car.id}`)}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                          >
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          {isAdminLocal && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => openEditDialog(car)}
                                variant="outline"
                                className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleDeleteCar(car.id)}
                                variant="outline"
                                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
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
              <h2 className="text-4xl font-bold text-white mb-4">Happy Customers</h2>
              <p className="text-gray-400 text-lg">See what our satisfied customers have to say</p>
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
                    {testimonial.image && (
                      <div className="w-full h-64 overflow-hidden rounded-t-lg flex items-center justify-center bg-gray-800">
                        <ImageWithFallback
                          src={testimonial.image}
                          alt={`${testimonial.customerName} testimonial`}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                          {(testimonial.customerName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg">{testimonial.customerName}</CardTitle>
                          <CardDescription className="text-gray-400 text-sm">{testimonial.carPurchased}</CardDescription>
                          <div className="flex gap-1 mt-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < testimonial.rating ? "fill-orange-400 text-orange-400" : "text-gray-600"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 italic">"{testimonial.feedback}"</p>
                      <p className="text-gray-500 text-sm mt-4">
                        Purchased: {testimonial.purchaseDate ? new Date(testimonial.purchaseDate).toLocaleDateString() : 'N/A'}
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
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Find Your Perfect Car?</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who found their dream vehicle with Sri kk cars.
              Contact us today!
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8">
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