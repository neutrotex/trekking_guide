"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Navbar from "@/components/Navbar"
import type { Guide } from "@/types/guide"

export default function GuideDetailsPage() {
  const params = useParams()
  const [guide, setGuide] = useState<(Guide & { userId?: { name: string; email: string } }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchGuide()
    }
  }, [params.id])

  const fetchGuide = async () => {
    try {
      const response = await fetch(`/api/guides/${params.id}`)
      const data = await response.json()
      setGuide(data.guide)
    } catch (error) {
      console.error("Error fetching guide:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#faf8f3" }}>
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <span style={{ color: "#6b5b4a" }}>Loading guide profile...</span>
        </div>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#faf8f3" }}>
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <span style={{ color: "#6b5b4a" }}>Guide profile not found.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf8f3" }}>
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section with Photo */}
          <div className="mb-12">
            <div
              className="rounded-2xl overflow-hidden shadow-lg h-80 flex items-center justify-center"
              style={{ backgroundColor: "#2d5016" }}
            >
              {guide.photoUrl ? (
                <img
                  src={guide.photoUrl || "/placeholder.svg"}
                  alt={guide.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-9xl">🏔️</span>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Sidebar - Quick Info */}
            <div className="lg:col-span-1">
              <div
                className="rounded-xl p-8 sticky top-24"
                style={{ backgroundColor: "#ffffff", borderLeft: "4px solid #8b6f47" }}
              >
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-6" style={{ color: "#8b6f47" }}>
                  Quick Info
                </h2>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#9ca3af" }}>
                      Experience
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "#2d5016" }}>
                      {guide.experienceYears}
                    </p>
                    <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>years on trails</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#9ca3af" }}>
                      Daily Rate
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "#8b6f47" }}>
                      ₹{guide.wagesPerDay}
                    </p>
                    <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>per day</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#9ca3af" }}>
                      Age
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "#2d5016" }}>
                      {guide.age}
                    </p>
                    <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>years old</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#9ca3af" }}>
                      Education
                    </p>
                    <p className="text-lg font-semibold" style={{ color: "#2d5016" }}>
                      {guide.education}
                    </p>
                  </div>
                </div>

                {/* Contact Section */}
                {guide.userId && (
                  <div className="mt-8 pt-8 border-t" style={{ borderColor: "#e5e7eb" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#9ca3af" }}>
                      Contact
                    </p>
                    <a
                      href={`mailto:${guide.userId.email}`}
                      className="text-sm font-medium hover:underline"
                      style={{ color: "#8b6f47" }}
                    >
                      {guide.userId.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right Content - Main Info */}
            <div className="lg:col-span-2">
              {/* Name and Title */}
              <div className="mb-10">
                <h1 className="text-5xl font-bold mb-2" style={{ color: "#1f2937" }}>
                  {guide.fullName}
                </h1>
                <p className="text-lg" style={{ color: "#8b6f47" }}>
                  Professional Trek Guide
                </p>
              </div>

              {/* About Section */}
              <div className="mb-12">
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "#8b6f47" }}>
                  About
                </h2>
                <p className="text-lg leading-relaxed" style={{ color: "#4b5563", lineHeight: "1.8" }}>
                  {guide.bio}
                </p>
              </div>

              {/* Expertise Highlights */}
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="p-6 rounded-lg" style={{ backgroundColor: "#f0f4e8" }}>
                  <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: "#8b6f47" }}>
                    Specialization
                  </p>
                  <p className="text-lg font-semibold" style={{ color: "#2d5016" }}>
                    Mountain Trekking
                  </p>
                </div>

                <div className="p-6 rounded-lg" style={{ backgroundColor: "#f0f4e8" }}>
                  <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: "#8b6f47" }}>
                    Languages
                  </p>
                  <p className="text-lg font-semibold" style={{ color: "#2d5016" }}>
                    English, Hindi
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <button
                className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-lg"
                style={{
                  backgroundColor: "#2d5016",
                  color: "#ffffff",
                }}
              >
                Book a Trek with {guide.fullName.split(" ")[0]}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
