import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Video, Plus, Clock, Users, MapPin, FileText } from "lucide-react"

export default async function MeetingsPage() {
  const session = await auth()

  if (!session) {
    redirect("/api/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Meetings</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user?.name || session.user?.email}
            </span>
            <a
              href="/dashboard"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Back to Mail
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Meetings</h1>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Upcoming", count: 5, color: "blue" },
            { label: "Today", count: 2, color: "green" },
            { label: "This Week", count: 8, color: "purple" },
            { label: "Completed", count: 24, color: "gray" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
            </div>
          ))}
        </div>

        {/* Meeting Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-3">
            <div className="flex gap-4">
              {["Scheduled", "In Progress", "Completed", "Cancelled"].map((tab, idx) => (
                <button
                  key={idx}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    idx === 0
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting List */}
          <div className="divide-y divide-gray-200">
            {[
              {
                title: "Product Roadmap Review",
                time: "Today, 10:00 AM - 11:00 AM",
                organizer: "John Smith",
                attendees: 5,
                location: "Zoom",
                status: "scheduled",
              },
              {
                title: "Sprint Planning",
                time: "Today, 2:00 PM - 3:30 PM",
                organizer: "Sarah Johnson",
                attendees: 8,
                location: "Conference Room A",
                status: "scheduled",
              },
              {
                title: "Client Presentation",
                time: "Tomorrow, 11:00 AM - 12:00 PM",
                organizer: "Mike Davis",
                attendees: 12,
                location: "Google Meet",
                status: "scheduled",
              },
              {
                title: "Team Retrospective",
                time: "Nov 15, 3:00 PM - 4:00 PM",
                organizer: session.user?.name || "You",
                attendees: 6,
                location: "Teams",
                status: "scheduled",
              },
            ].map((meeting, idx) => (
              <div key={idx} className="p-6 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          meeting.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {meeting.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {meeting.time}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {meeting.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        {meeting.organizer} • {meeting.attendees} attendees
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Join
                    </button>
                    <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 text-center text-gray-500">
          <p className="text-sm">
            This is the Meetings interface. Integrate with backend API to load real meetings.
          </p>
        </div>
      </div>
    </div>
  )
}
