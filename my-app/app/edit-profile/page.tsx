'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Guide } from '@/types/guide';

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [guide, setGuide] = useState<Guide | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    education: '',
    experienceYears: '',
    wagesPerDay: '',
    bio: '',
    photoUrl: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user.role !== 'guide') {
      router.push('/user-dashboard');
    } else if (status === 'authenticated' && session?.user.role === 'guide') {
      fetchProfile();
    }
  }, [status, session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/guides/profile');
      const data = await response.json();
      
      if (data.hasProfile && data.guide) {
        setGuide(data.guide);
        setFormData({
          fullName: data.guide.fullName,
          age: data.guide.age.toString(),
          education: data.guide.education,
          experienceYears: data.guide.experienceYears.toString(),
          wagesPerDay: data.guide.wagesPerDay.toString(),
          bio: data.guide.bio,
          photoUrl: data.guide.photoUrl,
        });
      } else {
        // If no profile exists, redirect to create profile
        router.push('/create-profile');
        return;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          age: parseInt(formData.age),
          education: formData.education,
          experienceYears: parseInt(formData.experienceYears),
          wagesPerDay: parseInt(formData.wagesPerDay),
          bio: formData.bio,
          photoUrl: formData.photoUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to update profile');
      } else {
        setMessage('Profile updated successfully! Redirecting to dashboard...');
        // Redirect to dashboard after successful update
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      setMessage('An error occurred while updating your profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'guide') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                ✏️ Edit Your Guide Profile
              </h1>
              <p className="text-gray-600">
                Update your profile information to keep it current and attractive to trekkers
              </p>
            </div>
            
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('success') 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    required
                    min="18"
                    max="65"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your age"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education *
                </label>
                <input
                  type="text"
                  required
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Bachelor's in Tourism, High School Diploma"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="50"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Years of trekking experience"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wages Per Day (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="500"
                    max="10000"
                    value={formData.wagesPerDay}
                    onChange={(e) => setFormData({ ...formData, wagesPerDay: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your daily rate"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tell us about your trekking experience, specialties, and what makes you a great guide..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://example.com/your-photo.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional: Add a professional photo to make your profile more attractive
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold"
                >
                  {submitting ? 'Updating Profile...' : 'Update Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Current Profile Preview */}
            {guide && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Profile Preview</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Name:</strong> {guide.fullName}</p>
                  <p><strong>Age:</strong> {guide.age} years</p>
                  <p><strong>Education:</strong> {guide.education}</p>
                  <p><strong>Experience:</strong> {guide.experienceYears} years</p>
                  <p><strong>Daily Rate:</strong> ₹{guide.wagesPerDay}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
