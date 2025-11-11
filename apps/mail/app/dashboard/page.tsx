import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Mail, Search, Star, Send, Archive, Trash2 } from "lucide-react"

export default async function DashboardPage() {
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
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Darevel Mail</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search mail..."
                className="pl-10 pr-4 py-2 w-96 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {session.user?.name || session.user?.email}
            </span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4">
          <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium mb-4 hover:shadow-lg transition">
            Compose
          </button>

          <nav className="space-y-1">
            {[
              { icon: Mail, label: "Inbox", count: 12 },
              { icon: Star, label: "Starred", count: 3 },
              { icon: Send, label: "Sent" },
              { icon: Archive, label: "Archive" },
              { icon: Trash2, label: "Trash" },
            ].map((item, idx) => (
              <button
                key={idx}
                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Inbox</h1>

            {/* Sample Email List */}
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {[
                {
                  sender: "Demo User",
                  subject: "Welcome to Darevel Mail",
                  preview: "Thank you for using our AI-powered email service...",
                  time: "10:30 AM",
                  unread: true,
                },
                {
                  sender: "Team Updates",
                  subject: "Weekly Newsletter",
                  preview: "Check out this week's highlights and updates...",
                  time: "Yesterday",
                  unread: false,
                },
                {
                  sender: "Support",
                  subject: "Your ticket has been resolved",
                  preview: "We're happy to inform you that your support ticket...",
                  time: "2 days ago",
                  unread: false,
                },
              ].map((email, idx) => (
                <div
                  key={idx}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                    email.unread ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {email.sender[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className={`font-semibold ${email.unread ? "text-gray-900" : "text-gray-700"}`}>
                          {email.sender}
                        </h3>
                        <span className="text-xs text-gray-500">{email.time}</span>
                      </div>
                      <p className={`text-sm mb-1 ${email.unread ? "font-medium text-gray-900" : "text-gray-700"}`}>
                        {email.subject}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{email.preview}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state hint */}
            <div className="mt-8 text-center text-gray-500">
              <p className="text-sm">
                This is a demo interface. Connect your email provider to start managing your inbox.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
