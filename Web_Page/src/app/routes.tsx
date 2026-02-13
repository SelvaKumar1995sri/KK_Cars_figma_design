import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Home from "./pages/Home";
import CarDetails from "./pages/CarDetails";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "car/:id", Component: CarDetails },
      { path: "contact", Component: Contact },
      { path: "register", Component: Register },
      { path: "admin", Component: Admin },
      { path: "*", Component: NotFound },
    ],
  },
]);