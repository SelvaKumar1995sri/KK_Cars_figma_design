import { useState } from "react";
import { API } from "../utils/apiConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Shield, Database, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { sampleCars, sampleTestimonials, sampleSales } from "../utils/sampleData";


export function AdminSetup() {
  const [loading, setLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  const handleSetupAdmin = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error("Please sign in first");
        setLoading(false);
        return;
      }

      // Set current user as admin (backend derives user from token)
      const response = await fetch(`${API}/set-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("You are now an admin! Refresh the page to access admin features.");
        setSetupComplete(true);
      } else {
        toast.error("Failed to set admin privileges");
      }
    } catch (error) {
      console.error("Error setting up admin:", error);
      toast.error("Failed to set up admin");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSampleData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error("Please sign in first");
        setLoading(false);
        return;
      }
      for (const car of sampleCars) {
        await fetch(`${API}/cars/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : '' },
          body: JSON.stringify(car),
        });
      }

      // Add sample testimonials
      for (const testimonial of sampleTestimonials) {
        await fetch(`${API}/testimonials`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : '' },
          body: JSON.stringify(testimonial),
        });
      }

      // Add sample sales
      for (const sale of sampleSales) {
        await fetch(`${API}/sales`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : '' },
          body: JSON.stringify(sale),
        });
      }

      toast.success("Sample data loaded successfully! Refresh the page.");
    } catch (error) {
      console.error("Error loading sample data:", error);
      toast.error("Failed to load sample data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-slate-800 border-orange-600 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-400" />
            Quick Setup
          </CardTitle>
          <CardDescription className="text-gray-400">
            Initialize admin access and sample data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {setupComplete && (
            <Alert className="bg-green-900/30 border-green-600">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-400">
                Admin setup complete! Refresh the page.
              </AlertDescription>
            </Alert>
          )}
          
          <Button
            onClick={handleSetupAdmin}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            disabled={loading}
          >
            <Shield className="mr-2 h-4 w-4" />
            Become Admin
          </Button>

          <Button
            onClick={handleLoadSampleData}
            variant="outline"
            className="w-full border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
            disabled={loading}
          >
            <Database className="mr-2 h-4 w-4" />
            Load Sample Data
          </Button>

          <p className="text-xs text-gray-500 text-center">
            For demo purposes only
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
