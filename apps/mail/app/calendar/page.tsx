import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Calendar, Plus, Clock, MapPin, Users } from "lucide-react"

export default async function CalendarPage() {
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
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Calendar</span>
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
          <h1 className="text-2xl font-bold text-gray-900">My Calendar</h1>
          <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>

        {/* Calendar View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calendar Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">November 2025</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-xs font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => (
                  <div
                    key={i}
                    className="aspect-square border border-gray-200 rounded-lg p-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="text-sm text-gray-700">{((i % 30) + 1)}</div>
                    {i % 7 === 3 && (
                      <div className="mt-1 text-xs bg-blue-100 text-blue-700 rounded px-1 truncate">
                        Team Meeting
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {[
                  {
                    title: "Team Standup",
                    time: "10:00 AM",
                    location: "Conference Room A",
                    color: "blue",
                  },
                  {
                    title: "Client Review",
                    time: "2:00 PM",
                    location: "Online",
                    color: "green",
                  },
                  {
                    title: "Design Workshop",
                    time: "4:00 PM",
                    location: "Studio",
                    color: "purple",
                  },
                ].map((event, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className={`flex items-start gap-2`}>
                      <div className={`w-3 h-3 rounded-full bg-${event.color}-500 mt-1`}></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{event.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Events</span>
                  <span className="font-bold text-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Meetings</span>
                  <span className="font-bold text-gray-900">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hours</span>
                  <span className="font-bold text-gray-900">14.5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 text-center text-gray-500">
          <p className="text-sm">
            This is the Calendar interface. Integrate with backend API to load real events.
          </p>
        </div>
      </div>
    </div>
  )
}
