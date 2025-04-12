import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      // Here you would typically send the form data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus("error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="outline" className="bg-primary-100 text-primary-800">
              Contact
            </Badge>
            <h1 className="text-3xl font-bold text-neutral-900">Get in Touch</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">
                Contact Information
              </h2>
              <div className="space-y-4 text-neutral-700">
                <div>
                  <h3 className="font-medium text-neutral-800">Email</h3>
                  <p>support@ethicalai.com</p>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800">Address</h3>
                  <p>
                    123 AI Ethics Street<br />
                    Tech City, TC 12345<br />
                    United States
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800">Office Hours</h3>
                  <p>
                    Monday - Friday: 9:00 AM - 5:00 PM<br />
                    Saturday - Sunday: Closed
                  </p>
                </div>
              </div>
            </div>

            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {status === "success" && (
                  <Alert>
                    <AlertDescription>
                      Thank you for your message! We'll get back to you soon.
                    </AlertDescription>
                  </Alert>
                )}
                {status === "error" && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      There was an error sending your message. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={status === "submitting"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={status === "submitting"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={status === "submitting"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={status === "submitting"}
                    className="min-h-[150px]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full"
                >
                  {status === "submitting" ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact; 