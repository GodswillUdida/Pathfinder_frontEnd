"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  Sparkles,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  User,
  Building2,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: string;
}

interface FormErrors {
  [key: string]: string;
}

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Our team responds within 24 hours",
    contact: "pathfinderofficial@gmail.com",
    href: "mailto:pathfinderofficial@gmail.com",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Mon-Fri from 9am to 6pm",
    contact: "+234 801 234 5678",
    href: "tel:+2348012345678",
    gradient: "from-green-500 to-green-600",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Come say hello at our office",
    contact: "Lagos, Nigeria",
    href: "#",
    gradient: "from-purple-500 to-purple-600",
  },
];

const socialLinks = [
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://www.facebook.com/pathfinderofficial",
    color: "hover:bg-blue-600",
    followers: "12.5K",
  },
  {
    name: "Twitter",
    icon: Twitter,
    href: "https://twitter.com/pathfinderoff",
    color: "hover:bg-sky-500",
    followers: "8.3K",
  },
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://www.instagram.com/pathfinderofficial/",
    color: "hover:bg-pink-600",
    followers: "15.2K",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://www.linkedin.com/company/pathfinderofficial",
    color: "hover:bg-blue-700",
    followers: "9.1K",
  },
];

const faqs = [
  {
    question: "How quickly will I receive a response?",
    answer:
      "We aim to respond to all inquiries within 24-48 hours during business days.",
  },
  {
    question: "Can I schedule a call with your team?",
    answer:
      "Absolutely! Mention your preferred time in the message, and we'll arrange a call.",
  },
  {
    question: "Do you offer institutional partnerships?",
    answer:
      "Yes! We work with universities and corporations. Contact us for enterprise solutions.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSuccess(true);

    // Reset form after success
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        inquiryType: "general",
      });
      setIsSuccess(false);
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.currentTarget;
    setFormData((prev: FormData) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: FormErrors) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="bg-white font-inter antialiased">
      <Navbar />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6 text-white">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-semibold font-poppins">
              We're Here to Help
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-poppins leading-tight">
            Get in Touch
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            We value your feedback and are here to assist you with any questions
            or concerns. Whether you're interested in our courses or need
            support, we're ready to help.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactMethods.map((method, idx) => (
              <a
                key={idx}
                href={method.href}
                className="group bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${method.gradient} rounded-2xl mb-4 group-hover:scale-110 transition-transform`}
                >
                  <method.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-poppins">
                  {method.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {method.description}
                </p>
                <p className="text-gray-900 font-semibold group-hover:text-blue-600 transition-colors break-words">
                  {method.contact}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Form - 2 columns */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 lg:p-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3 font-poppins">
                    Send us a Message
                  </h2>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you as soon as
                    possible.
                  </p>
                </div>

                {isSuccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 font-poppins">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-gray-600">
                      We'll get back to you within 24-48 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Inquiry Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
                        Inquiry Type
                      </label>
                      <select
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="courses">Course Information</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Name & Email */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full pl-11 pr-4 py-3 border ${
                              errors.name ? "border-red-500" : "border-gray-300"
                            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none`}
                            placeholder="John Doe"
                          />
                        </div>
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full pl-11 pr-4 py-3 border ${
                              errors.email
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none`}
                            placeholder="john@example.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
                        Subject *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className={`w-full pl-11 pr-4 py-3 border ${
                            errors.subject
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none`}
                          placeholder="How can we help you?"
                        />
                      </div>
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className={`w-full px-4 py-3 border ${
                          errors.message ? "border-red-500" : "border-gray-300"
                        } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none`}
                        placeholder="Tell us more about your inquiry..."
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group w-full px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-8">
              {/* Response Time */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-poppins">
                  Quick Response
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We aim to respond to all inquiries within 24-48 hours during
                  business days. For urgent matters, please call us directly.
                </p>
              </div>

              {/* FAQs */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 font-poppins">
                  Quick Questions
                </h3>
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <p className="font-semibold text-gray-900 mb-2 text-sm font-poppins">
                        {faq.question}
                      </p>
                      <p className="text-sm text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office Hours */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 font-poppins">
                  Office Hours
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-semibold text-gray-900">
                      9am - 6pm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-semibold text-gray-900">
                      10am - 4pm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-semibold text-gray-900">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700 font-poppins">
              Stay Connected
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-poppins">
            Follow Our Journey
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Stay updated with the latest news, course releases, and special
            offers by following us on social media
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {socialLinks.map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-2xl mb-4 group-hover:bg-gradient-to-br ${social.color} transition-all group-hover:scale-110`}
                >
                  <social.icon className="h-7 w-7 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 font-poppins">
                  {social.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {social.followers} followers
                </p>
                <span className="text-sm text-blue-600 font-semibold flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                  Follow
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
