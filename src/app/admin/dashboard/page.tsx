"use client";

import { useEffect, useState } from "react";
import { BarChart3, Users, BookOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/axios"; // make sure axios instance exists

type Overview = {
  students: number;
  courses: number;
  enrollments: number;
  pendingEnrollments: number;
  systemStatus: string;
  updatedAt: string;
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get<Overview>("/api/v1/admin/overview");
        setData(res.data);
      } catch (err:any) {
        toast.error(
          err.response?.data?.error || err.message || "Error loading metrics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full" />
      </div>
    );

  if (!data)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <AlertCircle className="w-6 h-6 mr-2 inline" />
        Failed to load metrics
      </div>
    );

  const stats = [
    {
      label: "Total Students",
      value: data.students,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      color: "bg-blue-100",
    },
    {
      label: "Active Courses",
      value: data.courses,
      icon: <BookOpen className="w-5 h-5 text-green-600" />,
      color: "bg-green-100",
    },
    {
      label: "Enrollments",
      value: data.enrollments,
      icon: <BarChart3 className="w-5 h-5 text-yellow-600" />,
      color: "bg-yellow-100",
    },
    {
      label: "Pending Enrollments",
      value: data.pendingEnrollments,
      icon: <BarChart3 className="w-5 h-5 text-red-600" />,
      color: "bg-red-100",
    },
  ];

  return (
    <section className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Last updated: {new Date(data.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-4 bg-white border rounded-2xl shadow hover:shadow-md transition duration-300"
          >
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.color}`}
            >
              {stat.icon}
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-500">
              {stat.label}
            </h3>
            <p className="text-xl font-semibold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* System Status */}
      <div className="bg-white border rounded-2xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">System Status</h2>
        <p className="text-gray-700">{data.systemStatus}</p>
      </div>
    </section>
  );
}
