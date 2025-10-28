'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Guide } from '@/types/guide';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
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
    } else if (status === 'authenticated' && session?.user.role === 'guide') {
      fetchProfile();
    }
  }, [status, session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/guides');
      const data = await response.json();
      
      const myGuide = data.guides?.find((g: Guide) => g.userId === session?.user.id);
      
      if (myGuide) {
        setGuide(myGuide);
        setFormData({
          fullName: myGuide.fullName,
          age: myGuide.age.toString(),
          education: myGuide.education,
          experienceYears: myGuide.experienceYears.toString(),
          wagesPerDay: myGuide.wagesPerDay.toString(),
          bio: myGuide.bio,
          photoUrl: myGuide.photoUrl,
        });
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
        setMessage(data.error || 'Failed to save profile');
      } else {
        setMessage('Profile saved successfully!');
        fetchProfile();
      }
    } catch (error) {
      setMessage('An error occurred');
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
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          👤 Guide Dashboard
        </h1>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {guide ? 'Edit Profile' : 'Create Profile'}
            </h2>
            
            {message && (
              <div className={`mb-4 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  required
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wages per Day (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.wagesPerDay}
                  onChange={(e) => setFormData({ ...formData, wagesPerDay: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold"
              >
                {submitting ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

