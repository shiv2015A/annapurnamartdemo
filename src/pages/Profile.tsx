import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, Save, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, loading } = useAuth();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gps, setGps] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.phone) setPhone(data.phone);
          if (data.address) setAddress(data.address);
          if (data.gps) setGps(data.gps);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        phone,
        address,
        gps
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Profile Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 flex items-center space-x-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-2xl">
            {user.email?.[0].toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Saved Delivery Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <User className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Saved Delivery Details</h2>
          </div>
          
          <div className="p-6">
            {isLoadingProfile ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <p className="text-sm text-gray-600 mb-4">
                  Save your delivery details here so they automatically fill in when you checkout.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    maxLength={19}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="e.g., 9876543210"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <textarea 
                    maxLength={499}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                    rows={3}
                    placeholder="Full address with landmark"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPS Location (Optional)</label>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      maxLength={99}
                      value={gps}
                      onChange={(e) => setGps(e.target.value)}
                      className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                      placeholder="Latitude, Longitude"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              setGps(`${position.coords.latitude}, ${position.coords.longitude}`);
                              toast.success('Location acquired!');
                            },
                            () => toast.error('Failed to get location.')
                          );
                        }
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md border border-gray-300 flex items-center transition-colors"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Get
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center justify-center w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-slate-900 font-medium py-2 px-6 rounded-md transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Details'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
