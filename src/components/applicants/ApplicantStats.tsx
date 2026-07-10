"use client";

import { useApplicationStats } from "@/hooks/useApplicants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

export function ApplicantStatsCard() {
  const { data: stats, isLoading } = useApplicationStats();

  if (isLoading) {
    return (
      <div className="grid gap-24 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-24">
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-24 w-24 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Applicants",
      value: stats?.totalApplicants || 0,
      description: "All registered applicants",
      icon: Users,
      color: "bg-blue-100 text-blue-800",
    },
    {
      title: "Pending",
      value: stats?.pending || 0,
      description: "Awaiting review",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      title: "Approved",
      value: stats?.approved || 0,
      description: "Successfully approved",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800",
    },
    {
      title: "Rejected",
      value: stats?.data || 0,
      description: "Application rejected",
      icon: XCircle,
      color: "bg-red-100 text-red-800",
    },
  ];

  return (
    <div className="grid gap-24 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <CardHeader className="pb-16">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <div className={`p-12 rounded-lg ${item.color}`}>
                  <Icon className="h-20 w-20" />
                </div>
              </div>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-32 font-bold">{item.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}