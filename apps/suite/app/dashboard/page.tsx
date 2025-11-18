"use client";

import { useState, useEffect } from "react";
import {
  User,
  LogOut,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  MessageSquare,
  Mail,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AppStatus {
  name: string;
  port: number;
  status: "online" | "offline" | "checking";
  icon: React.ElementType;
  color: string;
  description: string;
}

export default function DashboardPage() {
  // Mock user data (replace with real auth later)
  const mockUser = {
    name: "Demo User",
    email: "demo@darevel.com",
    image: null,
  };

  const [appStatuses, setAppStatuses] = useState<AppStatus[]>([
    {
      name: "Chat",
      port: 3003,
      status: "checking",
      icon: MessageSquare,
      color: "from-blue-500 to-cyan-500",
      description: "Team communication",
    },
    {
      name: "Mail",
      port: 3008,
      status: "checking",
      icon: Mail,
      color: "from-red-500 to-orange-500",
      description: "Email management",
    },
    {
      name: "Excel",
      port: 3004,
      status: "checking",
      icon: FileSpreadsheet,
      color: "from-green-500 to-emerald-500",
      description: "Spreadsheet & data",
    },
    {
      name: "Slides",
      port: 3000,
      status: "checking",
      icon: Presentation,
      color: "from-purple-500 to-pink-500",
      description: "Presentations",
    },
  ]);

  // Check app health status
  useEffect(() => {
    const checkAppStatus = async (app: AppStatus) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`http://localhost:${app.port}/api/health`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        setAppStatuses((prev) =>
          prev.map((a) =>
            a.port === app.port
              ? { ...a, status: response.ok ? "online" : "offline" }
              : a
          )
        );
      } catch (error) {
        setAppStatuses((prev) =>
          prev.map((a) => (a.port === app.port ? { ...a, status: "offline" } : a))
        );
      }
    };

    appStatuses.forEach((app) => {
      checkAppStatus(app);
    });
  }, []);

  // Get user initials for avatar
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const onlineApps = appStatuses.filter((app) => app.status === "online").length;
  const totalApps = appStatuses.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Darevel Suite
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={mockUser.image || undefined} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {getInitials(mockUser.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {mockUser.name || mockUser.email}
                </span>
              </div>

              <Button
                onClick={() => window.location.href = "/dashboard/profile"}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>

              <Button
                onClick={() => window.location.href = "/"}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with User Profile */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-white/20">
                  <AvatarImage src={mockUser.image || undefined} />
                  <AvatarFallback className="bg-white/20 text-white text-xl font-semibold">
                    {getInitials(mockUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    Welcome back, {mockUser.name?.split(" ")[0] || "User"}!
                  </h2>
                  <p className="text-blue-100 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {mockUser.email}
                  </p>
                </div>
              </div>

              {/* Role Badges */}
              <div className="flex flex-col gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white gap-1">
                  <User className="h-3 w-3" />
                  Demo Mode
                </Badge>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">{onlineApps}/{totalApps}</p>
                <p className="text-sm text-green-700">Apps Online</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">No Auth</p>
                <p className="text-sm text-blue-700">Testing Mode</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apps Grid */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Applications</h2>
          <p className="text-gray-600 mb-6">
            Access all Darevel productivity apps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {appStatuses.map((app) => {
            const Icon = app.icon;
            return (
              <Card
                key={app.name}
                className={`group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                  app.status === "offline" ? "opacity-60" : ""
                }`}
                onClick={() => {
                  if (app.status === "online") {
                    window.open(`http://localhost:${app.port}`, "_blank");
                  }
                }}
              >
                <div className={`h-2 bg-gradient-to-r ${app.color}`}></div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {app.status === "checking" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : app.status === "online" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <CardTitle className="group-hover:text-blue-600 transition-colors">
                    {app.name}
                  </CardTitle>
                  <CardDescription>{app.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Port {app.port}</span>
                    {app.status === "online" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Online
                      </Badge>
                    ) : app.status === "checking" ? (
                      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                        Checking...
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Offline
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System Status Footer */}
        <Card className="mt-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>System Status: Testing without authentication</span>
              </div>
              <div className="text-gray-500">
                Auth will be integrated later
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
