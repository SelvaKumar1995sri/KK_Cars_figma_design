import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { API } from "../utils/apiConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // If already logged in, redirect away
    const token = localStorage.getItem('access_token');
    if (token) {
      const redirectTo = (location.state as any)?.redirectTo || "/";
      navigate(redirectTo);
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Get tokens
      const tokenRes = await fetch(`${API}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signInData.email,
          password: signInData.password,
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok) {
        // Extract error message from various possible formats
        const errorMsg =
          tokenData?.detail ||
          tokenData?.non_field_errors?.[0] ||
          tokenData?.error ||   
          tokenData?.email?.[0] ||
          tokenData?.password?.[0] ||
          "Invalid email or password";
        toast.error(errorMsg);
        return;
      }

      // Step 2: Save tokens
      localStorage.setItem("access_token", tokenData.access);
      localStorage.setItem("refresh_token", tokenData.refresh);

      // Step 3: Fetch current user info
      const userRes = await fetch(`${API}/auth/me/`, {
        headers: { Authorization: `Bearer ${tokenData.access}` },
      });
      const userData = userRes.ok ? await userRes.json() : { email: signInData.email };

      // Step 4: Check if user is admin
      const adminRes = await fetch(`${API}/check-admin/`, {
        headers: { Authorization: `Bearer ${tokenData.access}` },
      });
      const adminData = adminRes.ok ? await adminRes.json() : { isAdmin: false };

      // Step 5: Notify app-wide listeners
      try {
        window.dispatchEvent(new CustomEvent("authChanged", { detail: userData }));
        window.dispatchEvent(new CustomEvent("adminChanged", { detail: adminData.isAdmin }));
      } catch (_) {}

      toast.success("Signed in successfully!");

      const redirectTo = (location.state as any)?.redirectTo || "/";
      navigate(redirectTo);

    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to Sri kk cars</h1>
          <p className="text-gray-400">Sign in to access admin features</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">Admin Login</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <p className="text-sm text-gray-400 text-center mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}