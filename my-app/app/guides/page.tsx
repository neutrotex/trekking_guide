"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import GuideCard from "@/components/GuideCard"
import type { Guide } from "@/types/guide"

export default function GuidesPage() {
  const [guides, setGuides] = useState<(Guide & { userId?: { name: string; email: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGuides()
  }, [])

  const fetchGuides = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/guides")

      if (!response.ok) {
        throw new Error("Failed to fetch guides from server")
      }

      const data = await response.json()
      setGuides(data.guides || [])
    } catch (error) {
      console.error("Error fetching guides:", error)
      setError("Unable to load guides. Please check if the server is running and database is connected.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: "#faf8f3", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ backgroundColor: "#2d5016", color: "#faf8f3", paddingTop: "4rem", paddingBottom: "3rem" }}>
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <h1 style={{ fontSize: "3rem", fontWeight: "700", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
              Discover Our Guides
            </h1>
            <p style={{ fontSize: "1.125rem", lineHeight: "1.6", opacity: "0.95", marginBottom: "0.5rem" }}>
              Meet experienced trek guides ready to lead your next adventure. Each guide brings unique expertise, local
              knowledge, and passion for the mountains.
            </p>
            <p style={{ fontSize: "0.95rem", opacity: "0.8" }}>
              {guides.length} {guides.length === 1 ? "guide" : "guides"} available
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              borderLeft: "4px solid #dc2626",
              padding: "1.25rem",
              marginBottom: "2rem",
              borderRadius: "0.375rem",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: "#991b1b", fontWeight: "500", marginBottom: "0.25rem" }}>Unable to Load Guides</p>
                <p style={{ color: "#7f1d1d", fontSize: "0.875rem" }}>{error}</p>
              </div>
              <button
                onClick={fetchGuides}
                style={{
                  backgroundColor: "#dc2626",
                  color: "#faf8f3",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  border: "none",
                  cursor: "pointer",
                  marginLeft: "1rem",
                  whiteSpace: "nowrap",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#b91c1c")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", paddingTop: "3rem", paddingBottom: "3rem" }}>
            <div
              style={{
                display: "inline-block",
                width: "2.5rem",
                height: "2.5rem",
                border: "3px solid #e5e7eb",
                borderTop: "3px solid #2d5016",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p style={{ color: "#6b7280", marginTop: "1rem", fontSize: "0.95rem" }}>Loading guides...</p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : guides.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: "3rem", paddingBottom: "3rem" }}>
            <p style={{ color: "#6b7280", fontSize: "1rem" }}>No guides found yet. Check back soon!</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {guides.map((guide) => (
              <GuideCard key={guide._id} guide={guide} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
