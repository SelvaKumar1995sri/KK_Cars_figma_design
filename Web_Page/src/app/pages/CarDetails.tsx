import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { API } from "../utils/apiConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Gauge, Fuel, Calendar, ArrowLeft, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../components/ui/input-otp";

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
  features?: string[];
  additional_images?: Array<{
    id: string;
    image: string;
    image_url: string;
  }>;
}

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadCarDetails(id);
    }
  }, [id]);

  const loadCarDetails = async (carId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/cars/${carId}/`);
      if (response.ok) {
        const carData = await response.json();
        setCar(carData);
      } else {
        setCar(null);
      }
    } catch (error) {
      console.error("Error loading car details:", error);
      toast.error("Failed to load car details");
      setCar(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!fullName || !phoneNumber) {
      toast.error("Please enter your name and phone number");
      return;
    }

    if (phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API}/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      if (response.ok) {
        setOtpSent(true);
        toast.success("OTP sent to your phone number");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyAndSubmit = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API}/verify-otp-enquiry/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          otp,
          fullName,
          carId: car?.id,
          carName: car?.name,
          message: `Enquiry for ${car?.name}`,
        }),
      });

      if (response.ok) {
        toast.success("Enquiry submitted successfully! We'll contact you soon.");
        setShowContactDialog(false);
        setFullName("");
        setPhoneNumber("");
        setOtp("");
        setOtpSent(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to submit enquiry");
      }
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast.error("Failed to submit enquiry");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Car not found</h2>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-white hover:text-orange-400"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div>
            <div className="relative rounded-xl overflow-hidden mb-4">
              <ImageWithFallback
                src={(car as any).image || (car as any).imageUrl}
                alt={car.name}
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 text-lg px-4 py-2">
                  {car.condition}
                </Badge>
              </div>
            </div>
            
            {/* Additional Images */}
            {car.additional_images && car.additional_images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {car.additional_images.map((img, index) => (
                  <div key={img.id} className="relative rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={img.image_url || img.image}
                      alt={`${car.name} - Image ${index + 1}`}
                      className="w-full h-20 object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => {
                        // You could implement a lightbox here
                        console.log('Image clicked:', img);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{car.name}</h1>
            <p className="text-xl text-gray-400 mb-6">
              {car.brand} {car.model} • {car.year}
            </p>

            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-8">
              ${car.price.toLocaleString()}
            </div>

            <Card className="bg-slate-800/50 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500/20 p-2 rounded-lg">
                      <Gauge className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Mileage</p>
                      <p className="text-white font-semibold">{car.mileage}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500/20 p-2 rounded-lg">
                      <Fuel className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Fuel Type</p>
                      <p className="text-white font-semibold">{car.fuelType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500/20 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Year</p>
                      <p className="text-white font-semibold">{car.year}</p>
                    </div>
                  </div>

                  {car.transmission && (
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500/20 p-2 rounded-lg">
                        <Gauge className="h-5 w-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Transmission</p>
                        <p className="text-white font-semibold">{car.transmission}</p>
                      </div>
                    </div>
                  )}

                  {car.color && (
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500/20 p-2 rounded-lg">
                        <div className="h-5 w-5 rounded-full" style={{ backgroundColor: car.color }}></div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Color</p>
                        <p className="text-white font-semibold capitalize">{car.color}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {car.description && (
              <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardHeader>
                  <CardTitle className="text-white">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{car.description}</p>
                </CardContent>
              </Card>
            )}

            {car.features && car.features.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardHeader>
                  <CardTitle className="text-white">Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {car.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={() => setShowContactDialog(true)}
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
            >
              <Phone className="mr-2 h-5 w-5" />
              Contact Us
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Contact Us</DialogTitle>
            <DialogDescription className="text-gray-400">
              {otpSent 
                ? "Enter the OTP sent to your phone number"
                : "Enter your details to enquire about this vehicle"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!otpSent ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-white">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button
                  onClick={handleSendOTP}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                >
                  {submitting ? "Sending..." : "Send OTP"}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-white">Enter OTP</Label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="bg-slate-700 border-slate-600 text-white" />
                        <InputOTPSlot index={1} className="bg-slate-700 border-slate-600 text-white" />
                        <InputOTPSlot index={2} className="bg-slate-700 border-slate-600 text-white" />
                        <InputOTPSlot index={3} className="bg-slate-700 border-slate-600 text-white" />
                        <InputOTPSlot index={4} className="bg-slate-700 border-slate-600 text-white" />
                        <InputOTPSlot index={5} className="bg-slate-700 border-slate-600 text-white" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    variant="outline"
                    className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleVerifyAndSubmit}
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                  >
                    {submitting ? "Verifying..." : "Verify & Submit"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}