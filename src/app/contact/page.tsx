"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  CheckCircle2,
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
  MessageSquare,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";

// ============================================================================
// TYPES
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
  color: string;
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
// DATA
// ============================================================================

const CONTACT_METHODS: ContactMethod[] = [
  {
    icon: Mail,
    title: "Email Us",
    description: "We respond within 24 hours",
    contact: "pathfinderofficialteam@gmail.com",
    href: "mailto:pathfinderofficialteam@gmail.com",
    color: "bg-blue-600",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Mon–Sat, 8am – 7pm",
    contact: "+234 701 458 0375",
    href: "tel:+2347014580375",
    color: "bg-emerald-600",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Come say hello",
    contact: "45 Abeokuta St, Ogba, Lagos",
    href: "#map",
    color: "bg-violet-600",
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
      "We aim to respond to all inquiries within 24–48 hours during business days. For urgent matters, please call us directly.",
  },
  {
    question: "Can I schedule a call with your team?",
    answer:
      "Absolutely! Mention your preferred time in the message, and we’ll arrange a call that works for both of us.",
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
// COMPONENT
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

    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email address";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[+]?[\d\s\-()]{10,}$/.test(formData.phone))
      newErrors.phone = "Please enter a valid phone number";

    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    else if (formData.subject.trim().length < 5)
      newErrors.subject = "Subject must be at least 5 characters";

    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.trim().length < 20)
      newErrors.message = "Message must be at least 20 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setIsSuccess(true);
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
      console.error(error);
      setErrors({ submit: "Failed to send message. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  return (
    <div className="bg-white antialiased">
      <Navbar />

      {/* ───────────────── HERO ───────────────── */}
      <section className="relative bg-[#0f172a] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-indigo-900/30" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-blue-300 font-medium text-sm tracking-wider uppercase mb-4">
              Contact Us
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Let’s start a conversation
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-xl">
              Have a question about our programs, partnerships, or need support?
              We’re here to help.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────── CONTACT METHODS ───────────────── */}
      <section className="relative -mt-12 z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-4 lg:gap-6">
          {CONTACT_METHODS.map((method) => (
            <a
              key={method.title}
              href={method.href}
              className="group bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 ${method.color} rounded-xl text-white mb-4 group-hover:scale-110 transition-transform`}
              >
                <method.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-lg">
                {method.title}
              </h3>
              <p className="text-sm text-slate-500 mt-1">{method.description}</p>
              <p className="mt-3 text-sm font-medium text-slate-800 break-all">
                {method.contact}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* ───────────────── FORM + SIDEBAR ───────────────── */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Send us a message
                </h2>
                <p className="mt-2 text-slate-600">
                  Fill out the form and we’ll get back to you as soon as
                  possible.
                </p>
              </div>

              {isSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Message sent successfully!
                  </h3>
                  <p className="mt-2 text-slate-600">
                    We’ll get back to you within 24–48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Inquiry Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Inquiry Type
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="courses">Course Information</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Name + Email */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                            errors.name ? "border-red-500" : "border-slate-300"
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                            errors.email ? "border-red-500" : "border-slate-300"
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone + Subject */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+234 800 000 0000"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                            errors.phone ? "border-red-500" : "border-slate-300"
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Subject *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="How can we help?"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                            errors.subject
                              ? "border-red-500"
                              : "border-slate-300"
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                        />
                      </div>
                      {errors.subject && (
                        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.subject}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us more about your inquiry..."
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.message ? "border-red-500" : "border-slate-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none`}
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errors.submit}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Response Time */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">Quick Response</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                We typically reply within 24–48 hours on business days. For
                urgent matters, give us a call.
              </p>
            </div>

            {/* Office Hours */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">
                Office Hours
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Monday – Friday</span>
                  <span className="font-medium text-slate-800">9am – 6pm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Saturday & Sunday</span>
                  <span className="font-medium text-slate-800">8am – 7pm</span>
                </div>
              </div>
            </div>

            {/* Map Preview */}
            <div
              id="map"
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
            >
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Our Location</h3>
                <p className="text-sm text-slate-500 mt-1">
                  45 Abeokuta St, Ogba, Lagos
                </p>
              </div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.081663153641!2d3.3390853!3d6.6367804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b93e20104510f%3A0xa5136626d87ff4b8!2s45%20Abeokuta%20St%2C%20Ogba%2C%20Lagos%20100283%2C%20Lagos!5e0!3m2!1sen!2sng!4v1769608826941!5m2!1sen!2sng"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                title="Pathfinder Office Location"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── FAQ ───────────────── */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <HelpCircle className="h-4 w-4" />
              FAQs
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Common questions
            </h2>
            <p className="mt-3 text-slate-600">
              Quick answers to the things students ask most often.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenFaq(openFaq === idx ? null : idx)
                  }
                  className="w-full flex items-center justify-between p-5 text-left"
                  aria-expanded={openFaq === idx}
                >
                  <span className="font-medium text-slate-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === idx ? "max-h-48" : "max-h-0"
                  }`}
                >
                  <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── SOCIAL ───────────────── */}
      <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Stay connected
          </h2>
          <p className="mt-3 text-slate-600 max-w-lg mx-auto">
            Follow us for course updates, tips, and special offers.
          </p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center p-5 rounded-2xl border border-slate-200 hover:border-transparent hover:shadow-lg transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 group-hover:text-white transition-colors ${social.color}`}
                >
                  <social.icon className="h-5 w-5 text-slate-600 group-hover:text-white" />
                </div>
                <span className="font-medium text-slate-900 text-sm">
                  {social.name}
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {social.followers}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}