"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { User, Save, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/api/auth/signin");
    }

    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [status, session]);

  // Extract user roles
  const getUserRoles = (): string[] => {
    if (!session?.accessToken) return [];
    try {
      const payload = JSON.parse(atob(session.accessToken.split(".")[1]));
      return payload.realm_access?.roles || [];
    } catch (error) {
      return [];
    }
  };

  const userRoles = getUserRoles();
  const isAdmin = userRoles.includes("admin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:4000/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ name: formData.name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to update profile");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={session.user?.image || undefined} />
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                  {getInitials(session.user?.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">Your Profile</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
                <div className="flex gap-2 mt-2">
                  {isAdmin && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-900">
                      Admin
                    </Badge>
                  )}
                  {userRoles.filter((r) => r !== "admin" && r !== "user").map((role) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Message */}
              {success && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-green-800 font-medium">✓ Profile updated successfully!</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
                <p className="text-sm text-gray-500">This will be displayed across all Darevel apps</p>
              </div>

              {/* Email Field (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">
                  Email cannot be changed. Contact administrator if needed.
                </p>
              </div>

              {/* User ID (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  type="text"
                  value={session.user?.id || ""}
                  disabled
                  className="bg-gray-50 font-mono text-sm"
                />
                <p className="text-sm text-gray-500">Your unique Keycloak user identifier</p>
              </div>

              {/* Roles (Read-only) */}
              <div className="space-y-2">
                <Label>Assigned Roles</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                  {userRoles.map((role) => (
                    <Badge key={role} variant="secondary">
                      {role}
                    </Badge>
                  ))}
                  {userRoles.length === 0 && (
                    <span className="text-sm text-gray-500">No roles assigned</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Roles are managed by your administrator
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
            <CardDescription>Additional details about your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Authentication Provider:</span>
                <span className="font-medium">Keycloak SSO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Session Type:</span>
                <span className="font-medium">JWT (Stateless)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Status:</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
