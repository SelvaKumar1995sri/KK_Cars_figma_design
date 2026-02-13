import { Outlet, Link, useNavigate } from "react-router";
import { API } from "../utils/apiConfig";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Car, LogOut, User, Shield, Phone } from "lucide-react";
import { AdminSetup } from "../components/AdminSetup";
import { WelcomeGuide } from "../components/WelcomeGuide";
import { clearTokens } from "../utils/auth";


export default function Root() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check local JWT token and fetch current user
    (async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const res = await fetch(`${API}/auth/me/`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const user = await res.json();
          setUser(user);
          setShowAdminSetup(true);
          await checkAdminStatus(token);
        }
      } catch (err) {
        console.error('Error fetching current user', err);
      }
    })();
  }, []);

  const checkAdminStatus = async (accessToken: string) => {
    try {
      const response = await fetch(
        `${API}/check-admin`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      setIsAdmin(data.isAdmin || false);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const handleSignOut = async () => {
    clearTokens();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-orange-600/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Sri kk cars</h1>
                <p className="text-xs text-orange-400">Buy & Sell All Brands Cars</p>
              </div>
            </Link>

            <nav className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" className="text-white hover:text-orange-400">
                  Home
                </Button>
              </Link>
              
              <Link to="/contact">
                <Button variant="ghost" className="text-white hover:text-orange-400 gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Us
                </Button>
              </Link>
              
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" className="text-white hover:text-orange-400 gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-white">
                    <User className="h-5 w-5 text-orange-400" />
                    <span className="text-sm">{user.user_metadata?.name || user.email}</span>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="gap-2 border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
                    Admin Login
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-orange-600/30 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Car className="h-5 w-5 text-orange-400" />
                Sri kk cars
              </h3>
              <p className="text-gray-400 text-sm">
                Your trusted partner for buying and selling all car brands.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/" className="hover:text-orange-400">Home</Link></li>
                <li><Link to="/" className="hover:text-orange-400">Inventory</Link></li>
                <li><Link to="/contact" className="hover:text-orange-400">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Phone: (555) 123-4567</li>
                <li>Email: info@srikkk.com</li>
                <li>Hours: Mon-Sat 9AM-8PM</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Location</h4>
              <p className="text-gray-400 text-sm">
                123 Auto Boulevard<br />
                Car City, AC 12345
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
            © 2026 Sri kk cars. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Admin Setup Helper */}
      {showAdminSetup && <AdminSetup />}

      {/* Welcome Guide */}
      {/* <WelcomeGuide /> */}
    </div>
  );
}