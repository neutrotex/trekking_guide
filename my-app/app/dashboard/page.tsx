"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import AvailabilityCalendar from "@/components/AvailabilityCalendar"
import type { Guide } from "@/types/guide"

interface Booking {
  id: string
  guideId: string
  guideName: string
  userId: string
  userName: string
  from: string
  to: string
  duration: number
  totalCost: number
  status: "pending" | "confirmed" | "rejected" | "cancelled"
  createdAt: string
  expiresAt?: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [guide, setGuide] = useState<Guide | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const [message, setMessage] = useState("")
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] = useState(false)
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user.role === "guide") {
      fetchProfile()
    } else if (status === "authenticated" && session?.user.role === "user") {
      router.push("/user-dashboard")
    }
  }, [status, session])

  const fetchProfile = async () => {
    try {
      console.log("Fetching profile for user:", session?.user.id)
      const response = await fetch("/api/guides/profile")
      const data = await response.json()

      console.log("Profile check result:", data)

      if (data.hasProfile && data.guide) {
        setGuide(data.guide)
      } else {
        console.log("No guide profile found, redirecting to create profile")
        router.push("/create-profile")
        return
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (guide?._id) {
      console.log("Guide profile loaded, fetching bookings for guideId:", guide._id)
      fetchBookings()
    }
  }, [guide])

  const fetchBookings = async (_showRefreshing = false) => {
    try {
      console.log("Guide dashboard fetching bookings for guide profile:", guide)
      console.log("Using guide._id as guideId:", guide?._id)

      if (!guide?._id) {
        setBookings([])
        return
      }

      const response = await fetch(`/api/bookings?guideId=${guide._id}`)
      const data = await response.json()
      console.log("Guide dashboard received bookings:", data)

      setBookings(data.bookings || [])
    } catch (error) {
      console.error("Error fetching bookings:", error)
    }
  }

  const handleBookingStatus = async (bookingId: string, status: "confirmed" | "rejected") => {
    try {
      const response = await fetch("/api/bookings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId, status }),
      })

      if (response.ok) {
        setMessage(`Booking ${status} successfully`)
        await fetchBookings()
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
      }
    } catch (error) {
      setMessage("Error updating booking status")
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return
    }

    console.log("Cancelling booking with ID:", bookingId)

    setCancellingBooking(bookingId)
    try {
      const payload = { bookingId, status: "cancelled" }
      console.log("Sending payload:", payload)

      const response = await fetch("/api/bookings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("Response status:", response.status)

      if (response.ok) {
        setMessage("Booking cancelled successfully")
        await fetchBookings()
      } else {
        const error = await response.json()
        console.error("Error response:", error)
        setMessage(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error cancelling booking:", error)
      setMessage("Error cancelling booking")
    } finally {
      setCancellingBooking(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-700 border-emerald-300"
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-300"
      case "rejected":
        return "bg-rose-100 text-rose-700 border-rose-300"
      case "cancelled":
        return "bg-slate-100 text-slate-700 border-slate-300"
      default:
        return "bg-slate-100 text-slate-700 border-slate-300"
    }
  }

  const getDashboardStats = () => {
    const totalRequests = bookings.length
    const pendingRequests = bookings.filter((b) => b.status === "pending").length
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length
    const completedTreks = bookings.filter((b) => b.status === "confirmed").length
    const totalEarnings = bookings.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.totalCost, 0)
    const rejectionRate =
      totalRequests > 0
        ? ((bookings.filter((b) => b.status === "rejected").length / totalRequests) * 100).toFixed(1)
        : "0"

    return {
      totalRequests,
      pendingRequests,
      confirmedBookings,
      completedTreks,
      totalEarnings,
      rejectionRate,
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen" style={{ background: "#ffffff" }}>
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <span className="text-slate-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "guide") {
    return null
  }

  return (
    <div className="min-h-screen" style={{ background: "#ffffff" }}>
      <Navbar />
      <div className="container mx-auto px-4 py-8 w-[90%]">
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-5xl font-bold text-slate-800 mb-3">Welcome back, {guide?.fullName}!</h1>
              <p className="text-slate-600 text-lg">Manage your treks and track your mountain guide performance</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className="group relative rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border bg-gray-200 b" style={{borderColor: "#d4a574",}}
          >
            <div className="relative flex items-center">
              <div className="p-3 rounded-lg" style={{ background: "rgba(212, 165, 116, 0.2)" }}>
                <span className="text-3xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-700">Total Requests</p>
                <p className="text-3xl font-bold text-slate-900">{getDashboardStats().totalRequests}</p>
              </div>
            </div>
          </div>

          <div
            className="group relative rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border bg-gray-200 "
            style={{
              borderColor: "#f5d5a8",
            }}
          >
            <div className="relative flex items-center">
              <div className="p-3 rounded-lg" style={{ background: "rgba(245, 213, 168, 0.2)" }}>
                <span className="text-3xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-700">Pending Requests</p>
                <p className="text-3xl font-bold text-slate-900">{getDashboardStats().pendingRequests}</p>
              </div>
            </div>
          </div>

          <div
            className="group relative rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border bg-gray-200 "
            style={{
              borderColor: "#a8d5ba",
            }}
          >
            <div className="relative flex items-center">
              <div className="p-3 rounded-lg" style={{ background: "rgba(168, 213, 186, 0.2)" }}>
                <span className="text-3xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-700">Completed Treks</p>
                <p className="text-3xl font-bold text-slate-900">{getDashboardStats().completedTreks}</p>
              </div>
            </div>
          </div>

          <div
            className="group relative rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border bg-gray-200 "
            style={{
              borderColor: "#a8d5e8",
            }}
          >
            <div className="relative flex items-center">
              <div className="p-3 rounded-lg" style={{ background: "rgba(168, 213, 232, 0.2)" }}>
                <span className="text-3xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-700">Total Earnings</p>
                <p className="text-3xl font-bold text-slate-900">₹{getDashboardStats().totalEarnings}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            className="group relative rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border"
            style={{
              background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
              borderColor: "#a8d5ba",
            }}
          >
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Confirmed Bookings</p>
                <p className="text-4xl font-bold text-slate-900 mt-2">{getDashboardStats().confirmedBookings}</p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: "rgba(168, 213, 186, 0.2)" }}>
                <span className="text-4xl">🎯</span>
              </div>
            </div>
          </div>

          <div
            className="group relative rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border"
            style={{
              background: "linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)",
              borderColor: "#f1b0b7",
            }}
          >
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Rejection Rate</p>
                <p className="text-4xl font-bold text-slate-900 mt-2">{getDashboardStats().rejectionRate}%</p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: "rgba(241, 176, 183, 0.2)" }}>
                <span className="text-4xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div
            className="rounded-xl shadow-lg p-6 border"
            style={{
              background: "#f9f7f4",
              borderColor: "#e0d5c7",
            }}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⛺</span> Profile Management
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/edit-profile")}
                className="w-full text-white px-4 py-3 rounded-lg transition-all duration-300 font-semibold text-left flex items-center gap-2 group hover:shadow-lg bg-gray-500"
              >
                <span className="group-hover:scale-110 transition-transform">✏️</span> Edit Profile Information
              </button>
              <button
                onClick={() => {
                  /* TODO: Add photo upload */
                }}
                className="w-full text-white px-4 py-3 rounded-lg transition-all duration-300 font-semibold text-left flex items-center gap-2 group hover:shadow-lg bg-gray-500 hover:bg-gray-600 cursor-pointer"
              >
                <span className="group-hover:scale-110 transition-transform">📸</span> Update Profile Photo
              </button>
              <button
                onClick={() => setShowAvailabilityCalendar(true)}
                className="w-full text-white px-4 py-3 rounded-lg transition-all duration-300 font-semibold text-left flex items-center gap-2 group hover:shadow-lg bg-gray-500 hover:bg-gray-600 cursor-pointer"
              >
                <span className="group-hover:scale-110 transition-transform">📅</span> Set Availability Calendar
              </button>
            </div>
          </div>

          <div
            className="rounded-xl shadow-lg p-6 border"
            style={{
              background: "#f9f7f4",
              borderColor: "#e0d5c7",
            }}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🗺️</span> Trek Management
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => {
                  /* TODO: Add booking history */
                }}
                className="w-full text-white px-4 py-3 rounded-lg transition-all duration-300 font-semibold text-left flex items-center gap-2 group hover:shadow-lg bg-gray-500 hover:bg-gray-600 cursor-pointer"
              >
                <span className="group-hover:scale-110 transition-transform">📋</span> View Trek History
              </button>
              <button
                onClick={() => {
                  /* TODO: Add earnings report */
                }}
                className="w-full text-white px-4 py-3 rounded-lg transition-all duration-300 font-semibold text-left flex items-center gap-2 group hover:shadow-lg bg-gray-500 hover:bg-gray-600 cursor-pointer"
              >
                <span className="group-hover:scale-110 transition-transform">💰</span> View Earnings Report
              </button>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl shadow-lg p-6 mb-8 border"
          style={{
            background: "#f9f7f4",
            borderColor: "#e0d5c7",
          }}
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">🏅</span> Guide Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="flex items-center justify-between p-4 rounded-lg border"
              style={{ background: "rgba(168, 213, 186, 0.15)", borderColor: "rgba(168, 213, 186, 0.5)" }}
            >
              <div>
                <p className="text-sm font-medium text-slate-700">Profile Status</p>
                <p className="text-lg font-bold text-emerald-700 mt-1">Active</p>
              </div>
              <div className="p-2 rounded-full" style={{ background: "rgba(168, 213, 186, 0.3)" }}>
                <span className="text-emerald-700 text-xl">✓</span>
              </div>
            </div>

            <div
              className="flex items-center justify-between p-4 rounded-lg border"
              style={{ background: "rgba(168, 213, 232, 0.15)", borderColor: "rgba(168, 213, 232, 0.5)" }}
            >
              <div>
                <p className="text-sm font-medium text-slate-700">Daily Rate</p>
                <p className="text-lg font-bold text-blue-700 mt-1">₹{guide?.wagesPerDay || 0}</p>
              </div>
              <div className="p-2 rounded-full" style={{ background: "rgba(168, 213, 232, 0.3)" }}>
                <span className="text-blue-700 text-xl">₹</span>
              </div>
            </div>

            <div
              className="flex items-center justify-between p-4 rounded-lg border"
              style={{ background: "rgba(245, 213, 168, 0.15)", borderColor: "rgba(245, 213, 168, 0.5)" }}
            >
              <div>
                <p className="text-sm font-medium text-slate-700">Experience</p>
                <p className="text-lg font-bold text-amber-700 mt-1">{guide?.experienceYears || 0} years</p>
              </div>
              <div className="p-2 rounded-full" style={{ background: "rgba(245, 213, 168, 0.3)" }}>
                <span className="text-amber-700 text-xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl shadow-lg p-6 mb-8 border"
          style={{
            background: "#f9f7f4",
            borderColor: "#e0d5c7",
          }}
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">📈</span> Trek Performance Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="text-center p-4 rounded-lg border hover:shadow-lg transition-all"
              style={{ background: "rgba(168, 213, 186, 0.15)", borderColor: "rgba(168, 213, 186, 0.5)" }}
            >
              <div className="text-3xl font-bold text-emerald-700">₹{getDashboardStats().totalEarnings}</div>
              <div className="text-sm text-slate-700 mt-2">Total Earnings</div>
            </div>
            <div
              className="text-center p-4 rounded-lg border hover:shadow-lg transition-all"
              style={{ background: "rgba(168, 213, 232, 0.15)", borderColor: "rgba(168, 213, 232, 0.5)" }}
            >
              <div className="text-3xl font-bold text-blue-700">{getDashboardStats().confirmedBookings}</div>
              <div className="text-sm text-slate-700 mt-2">Completed Treks</div>
            </div>
            <div
              className="text-center p-4 rounded-lg border hover:shadow-lg transition-all"
              style={{ background: "rgba(245, 213, 168, 0.15)", borderColor: "rgba(245, 213, 168, 0.5)" }}
            >
              <div className="text-3xl font-bold text-amber-700">
                {getDashboardStats().totalRequests > 0
                  ? ((getDashboardStats().confirmedBookings / getDashboardStats().totalRequests) * 100).toFixed(1)
                  : "0"}
                %
              </div>
              <div className="text-sm text-slate-700 mt-2">Success Rate</div>
            </div>
            <div
              className="text-center p-4 rounded-lg border hover:shadow-lg transition-all"
              style={{ background: "rgba(212, 165, 116, 0.15)", borderColor: "rgba(212, 165, 116, 0.5)" }}
            >
              <div className="text-3xl font-bold text-amber-900">
                {getDashboardStats().totalRequests > 0
                  ? Math.round(getDashboardStats().totalEarnings / getDashboardStats().confirmedBookings)
                  : 0}
              </div>
              <div className="text-sm text-slate-700 mt-2">Avg. per Trek</div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl shadow-lg p-6 border"
          style={{
            background: "#f9f7f4",
            borderColor: "#e0d5c7",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-2xl">🏔️</span> Recent Trek Requests
            </h2>
            <div className="flex items-center gap-4">
              {bookings.filter((b) => b.status === "pending").length > 0 && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                  style={{ background: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)" }}
                >
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: "#ef4444" }}></div>
                  <span className="text-sm font-semibold text-red-700">
                    {bookings.filter((b) => b.status === "pending").length} New Request
                    {bookings.filter((b) => b.status === "pending").length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className={`border rounded-lg p-5 transition-all duration-300`}
                  style={{
                    background:
                      booking.status === "pending"
                        ? "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.04) 100%)"
                        : "rgba(212, 237, 218, 0.3)",
                    borderColor: booking.status === "pending" ? "rgba(239, 68, 68, 0.3)" : "rgba(168, 213, 186, 0.3)",
                  }}
                >
                  {booking.status === "pending" && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: "#ef4444" }}></div>
                      <span className="text-sm font-semibold text-red-700">NEW REQUEST - Action Required</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-800">{booking.userName}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-700 mb-3">
                        <div>
                          <span className="font-medium text-slate-800">Start Date:</span> {formatDate(booking.from)}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">End Date:</span> {formatDate(booking.to)}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">Total Cost:</span> ₹{booking.totalCost}
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 mb-4">Requested on {formatDate(booking.createdAt)}</div>

                      {booking.status === "pending" && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleBookingStatus(booking.id, "confirmed")}
                            className="text-white px-5 py-2 rounded-lg text-sm transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                            style={{ background: "linear-gradient(135deg, #2d7a4a 0%, #3d9a5a 100%)" }}
                          >
                            ✓ Confirm
                          </button>
                          <button
                            onClick={() => handleBookingStatus(booking.id, "rejected")}
                            className="text-white px-5 py-2 rounded-lg text-sm transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                            style={{ background: "linear-gradient(135deg, #8b4545 0%, #a85555 100%)" }}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {bookings.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-slate-600">Showing 5 of {bookings.length} bookings</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏔️</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No trek requests yet</h3>
              <p className="text-slate-600">Your trek requests will appear here when adventurers book your services.</p>
            </div>
          )}
        </div>
      </div>

      {/* Availability Calendar Modal */}
      {showAvailabilityCalendar && <AvailabilityCalendar onClose={() => setShowAvailabilityCalendar(false)} />}
    </div>
  )
}
