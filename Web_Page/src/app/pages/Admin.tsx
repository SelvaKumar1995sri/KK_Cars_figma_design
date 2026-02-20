import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { API } from "../utils/apiConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { 
  Car, TrendingUp, Users, DollarSign, Bell, 
  Plus, Trash2, Package, MessageSquare, ShoppingCart,
  Calendar, Award, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";



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
  description?: string;
  transmission?: string;
  color?: string;
}

interface Enquiry {
  id: string;
  carName: string;
  fullName: string;
  phoneNumber: string;
  message: string;
  status: string;
  comments: string;
  createdAt: string;
}

interface Sale {
  id: string;
  carBrand: string;
  carName: string;
  salePrice: number;
  profit: number;
  customerName: string;
  saleDate: string;
}

const COLORS = ['#f97316', '#dc2626', '#ea580c', '#fb923c', '#fdba74'];

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<CarData[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [newCarOpen, setNewCarOpen] = useState(false);
  const [newTestimonialOpen, setNewTestimonialOpen] = useState(false);
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [editComments, setEditComments] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const [newCar, setNewCar] = useState({
    name: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    mileage: "",
    fuelType: "Petrol",
    imageFile: null as File | null,
    additionalImages: [] as File[],
    condition: "Used",
    description: "",
    transmission: "Automatic",
    color: "#000000",
  });

  const [newTestimonial, setNewTestimonial] = useState({
    customerName: "",
    carPurchased: "",
    rating: 5,
    feedback: "",
    imageUrl: "https://images.unsplash.com/photo-1629991787749-e2a79eea0471?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwY3VzdG9tZXIlMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzA4NzcwOTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    purchaseDate: new Date().toISOString().split('T')[0],
  });

  const [newSale, setNewSale] = useState({
    carBrand: "",
    carName: "",
    salePrice: 0,
    profit: 0,
    customerName: "",
    saleDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    // For this app treat any logged-in user as admin for admin UI access.
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/register', { state: { redirectTo: '/admin' } });
        return;
      }
      setIsAdmin(true);
      await loadAllData(token || "");
    } catch (error) {
      console.error("Error during admin init:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async (accessToken: string) => {
    try {
      // Load cars
      const carsResponse = await fetch(`${API}/cars/`);
      const carsData = await carsResponse.json();
      setCars(carsData || []);

      // Load enquiries
      const enquiriesResponse = await fetch(`${API}/enquiries`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const enquiriesData = await enquiriesResponse.json();
      setEnquiries(enquiriesData || []);

      // Load sales
      const salesResponse = await fetch(`${API}/sales`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const salesData = await salesResponse.json();
      setSales(salesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleAddCar = async () => {
    try {
      const token = localStorage.getItem('access_token');
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
      
      // Add additional images
      newCar.additionalImages.forEach((file, index) => {
        form.append('additional_images', file);
      });

      const response = await fetch(`${API}/cars/`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        body: form,
      });

      if (response.ok) {
        toast.success("Car added successfully!");
        setNewCarOpen(false);
        loadAllData(token || "");
        setNewCar({
          name: "",
          brand: "",
          model: "",
          year: new Date().getFullYear(),
          price: 0,
          mileage: "",
          fuelType: "Petrol",
          imageFile: null,
          additionalImages: [],
          condition: "Used",
          description: "",
          transmission: "Automatic",
          color: "#000000",
        });
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add car");
      }
    } catch (error) {
      console.error("Error adding car:", error);
      toast.error("Failed to add car");
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (!confirm("Are you sure you want to delete this car?")) return;

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API}/cars/${carId}/`, {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

      if (response.ok) {
        toast.success("Car deleted successfully!");
          loadAllData(token || "");
      } else {
        toast.error("Failed to delete car");
      }
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error("Failed to delete car");
    }
  };

  const handleUpdateEnquiryStatus = async (enquiryId: string, status: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API}/enquiries/${enquiryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success("Enquiry status updated!");
        loadAllData(token || "");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating enquiry:", error);
      toast.error("Failed to update status");
    }
  };

  const handleAddTestimonial = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API}/testimonials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(newTestimonial),
      });

      if (response.ok) {
        toast.success("Testimonial added successfully!");
        setNewTestimonialOpen(false);
        setNewTestimonial({
          customerName: "",
          carPurchased: "",
          rating: 5,
          feedback: "",
          imageUrl: "https://images.unsplash.com/photo-1629991787749-e2a79eea0471?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwY3VzdG9tZXIlMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzA4NzcwOTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
          purchaseDate: new Date().toISOString().split('T')[0],
        });
      } else {
        toast.error("Failed to add testimonial");
      }
    } catch (error) {
      console.error("Error adding testimonial:", error);
      toast.error("Failed to add testimonial");
    }
  };

  const handleAddSale = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(newSale),
      });

      if (response.ok) {
        toast.success("Sale record added successfully!");
        setNewSaleOpen(false);
        loadAllData(token || "");
        setNewSale({
          carBrand: "",
          carName: "",
          salePrice: 0,
          profit: 0,
          customerName: "",
          saleDate: new Date().toISOString().split('T')[0],
        });
      } else {
        toast.error("Failed to add sale");
      }
    } catch (error) {
      console.error("Error adding sale:", error);
      toast.error("Failed to add sale");
    }
  };

  // Analytics calculations
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  const totalSales = sales.reduce((sum, sale) => sum + sale.salePrice, 0);
  const pendingEnquiries = enquiries.filter(e => e.status === 'pending').length;
  const convertedCustomers = enquiries.filter(e => e.status === 'converted').length;

  // Monthly data
  const monthlyData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const data = months.map(month => ({ month, sales: 0, profit: 0 }));
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.saleDate);
      if (saleDate.getFullYear() === currentYear) {
        const monthIndex = saleDate.getMonth();
        data[monthIndex].sales += sale.salePrice;
        data[monthIndex].profit += sale.profit;
      }
    });
    
    return data;
  })();

  // Brand distribution
  const brandData = (() => {
    const brandCount: { [key: string]: number } = {};
    sales.forEach(sale => {
      brandCount[sale.carBrand] = (brandCount[sale.carBrand] || 0) + 1;
    });
    return Object.entries(brandCount).map(([name, value]) => ({ name, value }));
  })();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your car dealership</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center justify-between">
                <span>Total Sales</span>
                <DollarSign className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">${totalSales.toLocaleString()}</div>
              <p className="text-white/80 text-sm mt-1">{sales.length} vehicles sold</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center justify-between">
                <span>Total Profit</span>
                <TrendingUp className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">${totalProfit.toLocaleString()}</div>
              <p className="text-white/80 text-sm mt-1">Year to date</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center justify-between">
                <span>Enquiries</span>
                <MessageSquare className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{enquiries.length}</div>
              <p className="text-white/80 text-sm mt-1">{pendingEnquiries} pending</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center justify-between">
                <span>Conversions</span>
                <Users className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{convertedCustomers}</div>
              <p className="text-white/80 text-sm mt-1">Converted customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-400" />
                Monthly Sales & Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="#f97316" name="Sales ($)" />
                  <Bar dataKey="profit" fill="#22c55e" name="Profit ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-400" />
                Sales by Brand
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={brandData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {brandData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Management */}
        <Tabs defaultValue="cars" className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="cars" className="data-[state=active]:bg-orange-600 text-white">
              <Package className="h-4 w-4 mr-2" />
              Manage Cars
            </TabsTrigger>
            <TabsTrigger value="enquiries" className="data-[state=active]:bg-orange-600 text-white">
              <Bell className="h-4 w-4 mr-2" />
              Enquiries {pendingEnquiries > 0 && (
                <Badge className="ml-2 bg-red-600">{pendingEnquiries}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-orange-600 text-white">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Sales Records
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="data-[state=active]:bg-orange-600 text-white">
              <MessageSquare className="h-4 w-4 mr-2" />
              Testimonials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cars">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Car Inventory</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your car listings
                    </CardDescription>
                  </div>
                  <Dialog open={newCarOpen} onOpenChange={setNewCarOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Car
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add New Car</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Fill in the car details
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Name</Label>
                          <Input
                            value={newCar.name}
                            onChange={(e) => setNewCar({ ...newCar, name: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Brand</Label>
                          <Input
                            value={newCar.brand}
                            onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Model</Label>
                          <Input
                            value={newCar.model}
                            onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Year</Label>
                          <Input
                            type="number"
                            value={newCar.year}
                            onChange={(e) => setNewCar({ ...newCar, year: parseInt(e.target.value) })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Price</Label>
                          <Input
                            type="number"
                            value={newCar.price}
                            onChange={(e) => setNewCar({ ...newCar, price: parseFloat(e.target.value) })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Mileage</Label>
                          <Input
                            value={newCar.mileage}
                            onChange={(e) => setNewCar({ ...newCar, mileage: e.target.value })}
                            placeholder="e.g., 25,000 km"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Fuel Type</Label>
                          <Select value={newCar.fuelType} onValueChange={(value) => setNewCar({ ...newCar, fuelType: value })}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="Petrol">Petrol</SelectItem>
                              <SelectItem value="Diesel">Diesel</SelectItem>
                              <SelectItem value="Electric">Electric</SelectItem>
                              <SelectItem value="Hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Condition</Label>
                          <Select value={newCar.condition} onValueChange={(value) => setNewCar({ ...newCar, condition: value })}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="New">New</SelectItem>
                              <SelectItem value="Used">Used</SelectItem>
                              <SelectItem value="Certified">Certified Pre-Owned</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Transmission</Label>
                          <Select value={newCar.transmission} onValueChange={(value) => setNewCar({ ...newCar, transmission: value })}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="Automatic">Automatic</SelectItem>
                              <SelectItem value="Manual">Manual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Color</Label>
                          <Input
                            value={newCar.color}
                            onChange={(e) => setNewCar({ ...newCar, color: e.target.value })}
                            placeholder="e.g., Black, White, Red"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-white">Main Image (upload)</Label>
                          <input type="file" accept="image/*" onChange={(e) => setNewCar({ ...newCar, imageFile: e.target.files ? e.target.files[0] : null })} />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-white">Additional Images (upload multiple)</Label>
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            onChange={(e) => setNewCar({ ...newCar, additionalImages: Array.from(e.target.files || []) })} 
                          />
                          {newCar.additionalImages.length > 0 && (
                            <p className="text-sm text-gray-400">{newCar.additionalImages.length} image(s) selected</p>
                          )}
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-white">Description</Label>
                          <Textarea
                            value={newCar.description}
                            onChange={(e) => setNewCar({ ...newCar, description: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            rows={3}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleAddCar}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 mt-4"
                      >
                        Add Car
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {cars.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No cars in inventory</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cars.map((car) => (
                      <div
                        key={car.id}
                        className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={(car as any).image || (car as any).imageUrl}
                            alt={car.name}
                            className="w-24 h-16 object-cover rounded"
                          />
                          <div>
                            <h3 className="text-white font-semibold">{car.name}</h3>
                            <p className="text-gray-400 text-sm">
                              {car.brand} {car.model} • {car.year}
                            </p>
                            <p className="text-orange-400 font-bold">${car.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDeleteCar(car.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enquiries">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Customer Enquiries</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage customer enquiries and convert them to sales
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enquiries.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No enquiries yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enquiries.map((enquiry) => (
                      <div
                        key={enquiry.id}
                        className="p-4 bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-white font-semibold">{enquiry.fullName}</h3>
                            <p className="text-gray-400 text-sm">{enquiry.phoneNumber}</p>
                          </div>
                          <Badge
                            className={
                              enquiry.status === 'pending'
                                ? 'bg-yellow-600'
                                : enquiry.status === 'converted'
                                ? 'bg-green-600'
                                : 'bg-gray-600'
                            }
                          >
                            {enquiry.status}
                          </Badge>
                        </div>
                        <p className="text-gray-300 mb-2">Interested in: {enquiry.carName}</p>
                        <p className="text-gray-500 text-sm mb-3">
                          {new Date(enquiry.createdAt).toLocaleString()}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateEnquiryStatus(enquiry.id, 'contacted')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Mark Contacted
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateEnquiryStatus(enquiry.id, 'converted')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark Converted
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Sales Records</CardTitle>
                    <CardDescription className="text-gray-400">
                      Track all completed sales
                    </CardDescription>
                  </div>
                  <Dialog open={newSaleOpen} onOpenChange={setNewSaleOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Sale
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Record New Sale</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-white">Car Brand</Label>
                          <Input
                            value={newSale.carBrand}
                            onChange={(e) => setNewSale({ ...newSale, carBrand: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Car Name</Label>
                          <Input
                            value={newSale.carName}
                            onChange={(e) => setNewSale({ ...newSale, carName: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Sale Price</Label>
                          <Input
                            type="number"
                            value={newSale.salePrice}
                            onChange={(e) => setNewSale({ ...newSale, salePrice: parseFloat(e.target.value) })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Profit</Label>
                          <Input
                            type="number"
                            value={newSale.profit}
                            onChange={(e) => setNewSale({ ...newSale, profit: parseFloat(e.target.value) })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Customer Name</Label>
                          <Input
                            value={newSale.customerName}
                            onChange={(e) => setNewSale({ ...newSale, customerName: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Sale Date</Label>
                          <Input
                            type="date"
                            value={newSale.saleDate}
                            onChange={(e) => setNewSale({ ...newSale, saleDate: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <Button
                          onClick={handleAddSale}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                        >
                          Add Sale Record
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No sales recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sales.map((sale) => (
                      <div
                        key={sale.id}
                        className="p-4 bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-white font-semibold">{sale.carName}</h3>
                            <p className="text-gray-400 text-sm">{sale.carBrand}</p>
                            <p className="text-gray-300 mt-2">Customer: {sale.customerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-orange-400 font-bold">${sale.salePrice.toLocaleString()}</p>
                            <p className="text-green-400 text-sm">Profit: ${sale.profit.toLocaleString()}</p>
                            <p className="text-gray-500 text-sm mt-1">
                              {new Date(sale.saleDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimonials">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Customer Testimonials</CardTitle>
                    <CardDescription className="text-gray-400">
                      Showcase happy customer reviews
                    </CardDescription>
                  </div>
                  <Dialog open={newTestimonialOpen} onOpenChange={setNewTestimonialOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Testimonial
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add Customer Testimonial</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-white">Customer Name</Label>
                          <Input
                            value={newTestimonial.customerName}
                            onChange={(e) => setNewTestimonial({ ...newTestimonial, customerName: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Car Purchased</Label>
                          <Input
                            value={newTestimonial.carPurchased}
                            onChange={(e) => setNewTestimonial({ ...newTestimonial, carPurchased: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Rating (1-5)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={newTestimonial.rating}
                            onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Feedback</Label>
                          <Textarea
                            value={newTestimonial.feedback}
                            onChange={(e) => setNewTestimonial({ ...newTestimonial, feedback: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Customer Image URL</Label>
                          <Input
                            value={newTestimonial.imageUrl}
                            onChange={(e) => setNewTestimonial({ ...newTestimonial, imageUrl: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Purchase Date</Label>
                          <Input
                            type="date"
                            value={newTestimonial.purchaseDate}
                            onChange={(e) => setNewTestimonial({ ...newTestimonial, purchaseDate: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <Button
                          onClick={handleAddTestimonial}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                        >
                          Add Testimonial
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-center py-8">
                  Add testimonials to showcase on the home page
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}