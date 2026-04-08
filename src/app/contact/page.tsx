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
  Loader2,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Navbar from "@/components/layout/Navbar";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  inquiryType: string;
}

interface FormErrors {
  [key: string]: string;
}

interface ContactMethod {
  icon: typeof Mail;
  title: string;
  description: string;
  contact: string;
  href: string;
  gradient: string;
}

interface SocialLink {
  name: string;
  icon: typeof Facebook;
  href: string;
  color: string;
  followers: string;
}

interface FAQ {
  question: string;
  answer: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CONTACT_METHODS: ContactMethod[] = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Our team responds within 24 hours",
    contact: "pathfinderofficialteam@gmail.com",
    href: "mailto:pathfinderofficialteam@gmail.com",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Mon-Sat from 8am to 7pm",
    contact: "+234 701 458 0375",
    href: "tel:+2347014580375",
    gradient: "from-green-500 to-green-600",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Come say hello at our office",
    contact: "45 Abeokuta St, Ogba, Lagos",
    href: "#map",
    gradient: "from-purple-500 to-purple-600",
  },
];

const SOCIAL_LINKS: SocialLink[] = [
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

const FAQS: FAQ[] = [
  {
    question: "How quickly will I receive a response?",
    answer:
      "We aim to respond to all inquiries within 24-48 hours during business days. For urgent matters, please call us directly.",
  },
  {
    question: "Can I schedule a call with your team?",
    answer:
      "Absolutely! Mention your preferred time in the message, and we'll arrange a call that works for both of us.",
  },
  {
    question: "What programs do you offer?",
    answer:
      "We offer professional accounting certifications including ICAN, ACCA, CIMA, CITN, and comprehensive diploma programs.",
  },
  {
    question: "Do you offer institutional partnerships?",
    answer:
      "Yes! We work with universities and corporations. Contact us for enterprise solutions and partnership opportunities.",
  },
  {
    question: "Are your courses available online?",
    answer:
      "Yes, we offer flexible learning options including online, physical, and hybrid modes to suit your schedule.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept bank transfers, card payments, and installment plans. Contact us for more payment options.",
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 20) {
      newErrors.message = "Message must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setIsSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          inquiryType: "general",
        });
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "Failed to send message. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-white antialiased">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#1d4ed8] py-16 sm:py-20 lg:py-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Left: Contact Information */}
            <div className="flex flex-col justify-between">
              {/* Contact Us Header */}
              <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-wider text-blue-200 mb-2">
                  Contact Us
                </h2>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Get in Touch
                </h1>
                <p className="text-lg text-blue-100 mt-4 max-w-xl">
                  We value your feedback and are here to assist you with any
                  questions or concerns.
                </p>
              </div>

              {/* Contact Methods List */}
              <ul className="space-y-6" role="list">
                {CONTACT_METHODS.map((method, idx) => (
                  <li key={idx}>
                    <a
                      href={method.href}
                      className="group flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
                    >
                      <div
                        className={`flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${method.gradient} rounded-xl shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        <method.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {method.title}
                        </h3>
                        <p className="text-sm text-blue-200 mb-2">
                          {method.description}
                        </p>
                        <p className="text-base font-semibold text-white break-words">
                          {method.contact}
                        </p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Image - Full Height */}
            <div className="relative h-full min-h-[500px] lg:min-h-[600px]">
              <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80"
                  alt="Students collaborating"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>

          {/* Map Section - Below Hero */}
          <div className="mt-12 lg:mt-16" id="map">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Our Location
              </h3>
              <p className="text-blue-100 mb-6">
                Visit our office for in-person consultations and support
              </p>
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.081663153641!2d3.3390853!3d6.6367804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b93e20104510f%3A0xa5136626d87ff4b8!2s45%20Abeokuta%20St%2C%20Ogba%2C%20Lagos%20100283%2C%20Lagos!5e0!3m2!1sen!2sng!4v1769608826941!5m2!1sen!2sng"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  title="Pathfinder Office Location - 45 Abeokuta St, Ogba, Lagos, Nigeria"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Form - 2 columns */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 lg:p-10 shadow-sm">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Send us a{" "}
                    <span className="relative inline-block">
                      <span className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Message
                      </span>
                      <svg
                        className="absolute -bottom-2 left-0 w-full h-3 text-blue-200"
                        viewBox="0 0 300 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 10C50 2 150 2 298 10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </h2>
                  <p className="text-gray-600">
                    Fill out the form below and we&apos;ll get back to you as
                    soon as possible.
                  </p>
                </div>

                {isSuccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-fadeIn">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-gray-600">
                      We&apos;ll get back to you within 24-48 hours.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    noValidate
                  >
                    {/* Inquiry Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Inquiry Type
                      </label>
                      <select
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                        aria-label="Select inquiry type"
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                            aria-label="Full name"
                            aria-invalid={!!errors.name}
                            aria-describedby={
                              errors.name ? "name-error" : undefined
                            }
                          />
                        </div>
                        {errors.name && (
                          <p
                            id="name-error"
                            className="mt-1 text-sm text-red-500 flex items-center gap-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                            aria-label="Email address"
                            aria-invalid={!!errors.email}
                            aria-describedby={
                              errors.email ? "email-error" : undefined
                            }
                          />
                        </div>
                        {errors.email && (
                          <p
                            id="email-error"
                            className="mt-1 text-sm text-red-500 flex items-center gap-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Phone & Subject */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full pl-11 pr-4 py-3 border ${
                              errors.phone
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none`}
                            placeholder="+234 800 000 0000"
                            aria-label="Phone number"
                            aria-invalid={!!errors.phone}
                            aria-describedby={
                              errors.phone ? "phone-error" : undefined
                            }
                          />
                        </div>
                        {errors.phone && (
                          <p
                            id="phone-error"
                            className="mt-1 text-sm text-red-500 flex items-center gap-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                            aria-label="Subject"
                            aria-invalid={!!errors.subject}
                            aria-describedby={
                              errors.subject ? "subject-error" : undefined
                            }
                          />
                        </div>
                        {errors.subject && (
                          <p
                            id="subject-error"
                            className="mt-1 text-sm text-red-500 flex items-center gap-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {errors.subject}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        aria-label="Message"
                        aria-invalid={!!errors.message}
                        aria-describedby={
                          errors.message ? "message-error" : undefined
                        }
                      />
                      {errors.message && (
                        <p
                          id="message-error"
                          className="mt-1 text-sm text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-sm text-red-600 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          {errors.submit}
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
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
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Quick Response
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We aim to respond to all inquiries within 24-48 hours during
                  business days. For urgent matters, please call us directly.
                </p>
              </div>

              {/* Office Hours */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
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
                    <span className="text-gray-600">Saturday & Sunday</span>
                    <span className="font-semibold text-gray-900">
                      8am - 7pm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">
                Common Inquiries
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Common Inquiries Students{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Have
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-blue-200"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M2 10C50 2 150 2 298 10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              Find quick answers to frequently asked questions
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                  aria-expanded={openFaq === idx}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span className="font-semibold text-gray-900 pr-8">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-blue-600 flex-shrink-0 transition-transform duration-300 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  id={`faq-answer-${idx}`}
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === idx ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
              Stay Connected
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Follow Our{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Journey
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-blue-200"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2 10C50 2 150 2 298 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Stay updated with the latest news, course releases, and special
            offers by following us on social media
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {SOCIAL_LINKS.map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-2xl mb-4 group-hover:scale-110 transition-all ${social.color}`}
                >
                  <social.icon className="h-7 w-7 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
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
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
