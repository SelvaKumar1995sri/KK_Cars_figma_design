import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Create Supabase clients
const getSupabaseAdmin = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const getSupabaseClient = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// OTP storage (in-memory for demo, use KV in production)
const otpStore = new Map<string, { otp: string; timestamp: number }>();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-d0c59136/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-d0c59136/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error during user signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Error in signup endpoint: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Send OTP endpoint
app.post("/make-server-d0c59136/send-otp", async (c) => {
  try {
    const { phoneNumber } = await c.req.json();
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with timestamp (expires in 10 minutes)
    otpStore.set(phoneNumber, {
      otp,
      timestamp: Date.now(),
    });
    
    // In production, send OTP via SMS service (Twilio, etc.)
    console.log(`OTP for ${phoneNumber}: ${otp}`);
    
    return c.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.log(`Error sending OTP: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Verify OTP and submit enquiry
app.post("/make-server-d0c59136/verify-otp-enquiry", async (c) => {
  try {
    const { phoneNumber, otp, fullName, carId, carName, message } = await c.req.json();
    
    // Verify OTP
    const storedData = otpStore.get(phoneNumber);
    if (!storedData) {
      return c.json({ error: "OTP not found or expired" }, 400);
    }
    
    // Check if OTP is expired (10 minutes)
    if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
      otpStore.delete(phoneNumber);
      return c.json({ error: "OTP expired" }, 400);
    }
    
    // Verify OTP matches
    if (storedData.otp !== otp) {
      return c.json({ error: "Invalid OTP" }, 400);
    }
    
    // OTP verified, delete it
    otpStore.delete(phoneNumber);
    
    // Create enquiry
    const enquiryId = `enquiry:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(enquiryId, {
      id: enquiryId,
      fullName,
      phoneNumber,
      carId: carId || null,
      carName: carName || null,
      message: message || `Enquiry for ${carName}`,
      status: 'pending',
      comments: '',
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, enquiryId });
  } catch (error) {
    console.log(`Error verifying OTP and creating enquiry: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all cars
app.get("/make-server-d0c59136/cars", async (c) => {
  try {
    const cars = await kv.getByPrefix("car:");
    return c.json({ cars });
  } catch (error) {
    console.log(`Error fetching cars: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Add car (admin only)
app.post("/make-server-d0c59136/cars", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const adminData = await kv.get(`admin:${user.id}`);
    if (!adminData) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const carData = await c.req.json();
    const carId = `car:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(carId, {
      ...carData,
      id: carId,
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, carId });
  } catch (error) {
    console.log(`Error adding car: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete car (admin only)
app.delete("/make-server-d0c59136/cars/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const adminData = await kv.get(`admin:${user.id}`);
    if (!adminData) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const carId = c.req.param('id');
    await kv.del(carId);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting car: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all enquiries (admin only)
app.get("/make-server-d0c59136/enquiries", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const adminData = await kv.get(`admin:${user.id}`);
    if (!adminData) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const enquiries = await kv.getByPrefix("enquiry:");
    return c.json({ enquiries });
  } catch (error) {
    console.log(`Error fetching enquiries: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Update enquiry status (admin only)
app.put("/make-server-d0c59136/enquiries/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const adminData = await kv.get(`admin:${user.id}`);
    if (!adminData) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const enquiryId = c.req.param('id');
    const { status, comments } = await c.req.json();
    
    const existingEnquiry = await kv.get(enquiryId);
    if (!existingEnquiry) {
      return c.json({ error: 'Enquiry not found' }, 404);
    }

    await kv.set(enquiryId, {
      ...existingEnquiry,
      status: status !== undefined ? status : existingEnquiry.status,
      comments: comments !== undefined ? comments : existingEnquiry.comments,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error updating enquiry: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Add sale record (admin only)
app.post("/make-server-d0c59136/sales", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const adminData = await kv.get(`admin:${user.id}`);
    if (!adminData) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const saleData = await c.req.json();
    const saleId = `sale:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(saleId, {
      ...saleData,
      id: saleId,
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, saleId });
  } catch (error) {
    console.log(`Error adding sale: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all sales (admin only)
app.get("/make-server-d0c59136/sales", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const adminData = await kv.get(`admin:${user.id}`);
    if (!adminData) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const sales = await kv.getByPrefix("sale:");
    return c.json({ sales });
  } catch (error) {
    console.log(`Error fetching sales: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get testimonials
app.get("/make-server-d0c59136/testimonials", async (c) => {
  try {
    const testimonials = await kv.getByPrefix("testimonial:");
    return c.json({ testimonials });
  } catch (error) {
    console.log(`Error fetching testimonials: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Add testimonial (admin only)
app.post("/make-server-d0c59136/testimonials", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const adminData = await kv.get(`admin:${user.id}`);
    if (!adminData) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const testimonialData = await c.req.json();
    const testimonialId = `testimonial:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(testimonialId, {
      ...testimonialData,
      id: testimonialId,
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, testimonialId });
  } catch (error) {
    console.log(`Error adding testimonial: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Check admin status
app.get("/make-server-d0c59136/check-admin", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ isAdmin: false });
    }

    const adminData = await kv.get(`admin:${user.id}`);
    return c.json({ isAdmin: !!adminData });
  } catch (error) {
    console.log(`Error checking admin status: ${error}`);
    return c.json({ isAdmin: false });
  }
});

// Set admin (for initial setup - in production this should be more secure)
app.post("/make-server-d0c59136/set-admin", async (c) => {
  try {
    const { userId } = await c.req.json();
    await kv.set(`admin:${userId}`, { isAdmin: true, createdAt: new Date().toISOString() });
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error setting admin: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);