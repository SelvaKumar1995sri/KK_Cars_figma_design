import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { X, Rocket, User, Shield, Database } from "lucide-react";

export function WelcomeGuide() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome guide
    const hasSeenGuide = localStorage.getItem('hasSeenWelcomeGuide');
    if (!hasSeenGuide) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('hasSeenWelcomeGuide', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-orange-600 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-lg">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Welcome to AutoElite!</h2>
                <p className="text-gray-400 text-sm">Your premium car dealership platform</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <Alert className="bg-slate-700/50 border-orange-600/50">
              <User className="h-5 w-5 text-orange-400" />
              <AlertTitle className="text-white">Step 1: Create Your Account</AlertTitle>
              <AlertDescription className="text-gray-300">
                Click <strong>"Sign In / Register"</strong> in the top-right corner to create your account or sign in.
              </AlertDescription>
            </Alert>

            <Alert className="bg-slate-700/50 border-orange-600/50">
              <Shield className="h-5 w-5 text-orange-400" />
              <AlertTitle className="text-white">Step 2: Become Admin</AlertTitle>
              <AlertDescription className="text-gray-300">
                After signing in, use the <strong>"Quick Setup"</strong> panel (bottom-right) to grant yourself admin privileges. Don't forget to refresh!
              </AlertDescription>
            </Alert>

            <Alert className="bg-slate-700/50 border-orange-600/50">
              <Database className="h-5 w-5 text-orange-400" />
              <AlertTitle className="text-white">Step 3: Load Sample Data</AlertTitle>
              <AlertDescription className="text-gray-300">
                Click <strong>"Load Sample Data"</strong> to populate the site with cars, testimonials, and sales. Refresh to see the changes!
              </AlertDescription>
            </Alert>

            <div className="bg-gradient-to-r from-orange-500/20 to-red-600/20 border border-orange-600/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">What's Included:</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>✅ Browse premium car inventory</li>
                <li>✅ User authentication with Google OAuth support</li>
                <li>✅ Customer enquiry system</li>
                <li>✅ Admin dashboard with analytics and graphs</li>
                <li>✅ Sales tracking and profit reports</li>
                <li>✅ Customer testimonials showcase</li>
              </ul>
            </div>

            <Button
              onClick={handleDismiss}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              size="lg"
            >
              Let's Get Started!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
