import { useState } from "react";
import { API } from "../utils/apiConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../components/ui/input-otp";

export default function Contact() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSendOTP = async () => {
    if (!fullName || !phoneNumber || !message) {
      toast.error("Please fill in all fields");
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
        body: JSON.stringify({ phoneNumber, otp, fullName, message }),
      });

      if (response.ok) {
        toast.success("Message sent successfully! We'll contact you soon.");
        setFullName("");
        setPhoneNumber("");
        setMessage("");
        setOtp("");
        setOtpSent(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to submit message");
      }
    } catch (error) {
      console.error("Error submitting message:", error);
      toast.error("Failed to submit message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-gray-400">
            Get in touch with us. We're here to help!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Get In Touch</CardTitle>
                <CardDescription className="text-gray-400">
                  We'd love to hear from you. Here's how you can reach us.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Phone</h3>
                    <p className="text-gray-400">9962701160</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email</h3>
                    <p className="text-gray-400">info@srikkk.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Location</h3>
                    <p className="text-gray-400 text-sm">
                      No. 75/2, 200 Feet Radial Road,<br />
                      Kovilambakkam
                      Chennai - 600 129
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Hours</h3>
                    <p className="text-gray-400">
                      Monday - Saturday<br />
                      9:00 AM - 8:00 PM
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Send Us a Message</CardTitle>
              <CardDescription className="text-gray-400">
                {otpSent 
                  ? "Enter the OTP sent to your phone number"
                  : "Fill out the form below and we'll get back to you soon"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!otpSent ? (
                <div className="space-y-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white">Message</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us how we can help you"
                      rows={5}
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
                </div>
              ) : (
                <div className="space-y-4">
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
                      className="flex-1 border-slate-600 text-black hover:bg-slate-700"
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
