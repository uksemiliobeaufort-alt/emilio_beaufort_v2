'use client';

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  signOut,
  deleteUser,
  updateProfile,
} from "firebase/auth";
import { auth, storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-hot-toast";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [instantUser, setInstantUser] = useState(user);

  useEffect(() => {
    const cached = localStorage.getItem("authUser");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setInstantUser(parsed);
        setNewPhone(parsed.phoneNumber || "");
        setNewAddress(parsed.address || "");
        if (!user) updateUser(parsed);
      } catch {
        localStorage.removeItem("authUser");
      }
    }
  }, [user, updateUser]);

  const currentUser = user || instantUser;

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Please login or signup to view your profile.
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("authUser");
      updateUser({});
      try { window.dispatchEvent(new Event("auth-updated")); } catch {}
      window.location.href = "/";
    } catch (err: any) {
      toast.error(`Failed to sign out: ${err.message}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;

    try {
      await deleteUser(auth.currentUser);
      localStorage.removeItem("authUser");
      updateUser({});
      toast.success("Account deleted successfully.");
      window.location.href = "/";
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account.");

    }
  };

  const handleAvatarChange = async (file: File) => {
  if (!file || !auth.currentUser) return;

  const localPreview = URL.createObjectURL(file);
  setPreview(localPreview);
  updateUser({ photoURL: localPreview });

  // 🔹 Broadcast immediately so Navbar updates preview right away
  try { window.dispatchEvent(new Event("auth-updated")); } catch {}

  setUploading(true);
  try {
    const fileRef = ref(storage, `avatars/${currentUser.uid}`);
    await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);
    await updateProfile(auth.currentUser, { photoURL });

    updateUser({ photoURL });

    const cached = JSON.parse(localStorage.getItem("authUser") || "{}");
    localStorage.setItem(
      "authUser",
      JSON.stringify({ ...cached, photoURL })
    );

    // 🔹 Broadcast after saving the final uploaded photo
    try { window.dispatchEvent(new Event("auth-updated")); } catch {}

    setPreview(photoURL);
    toast.success("Avatar updated successfully!");
  } catch (err: any) {
    console.error("Error uploading avatar", err);
    toast.error(err.message || "Failed to upload avatar.");

    updateUser({ photoURL: currentUser.photoURL || null });
    setPreview(null);
  } finally {
    setUploading(false);
  }
};

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleAvatarChange(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      handleAvatarChange(e.dataTransfer.files[0]);
    }
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser || !newName.trim()) {
      setEditing(false);
      return;
    }
    try {
      await updateProfile(auth.currentUser, { displayName: newName.trim() });
      updateUser({
        displayName: newName.trim(),
        phoneNumber: newPhone.trim(),
        address: newAddress.trim(),
      });
      const cached = JSON.parse(localStorage.getItem("authUser") || "{}");
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          ...cached,
          displayName: newName.trim(),
          phoneNumber: newPhone.trim(),
          address: newAddress.trim(),
        })
      );
      toast.success("Profile updated!");
    } catch (err) {
      console.error("Error updating profile", err);
      toast.error("Failed to update profile.");
    } finally {
      setEditing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-10 relative">
        {/* Close / Remove Button */}
  <button
    onClick={() => window.history.back()} // Goes back to previous page
    className="absolute top-4 right-4 bg-white text-black font-bold rounded-full w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white transition"
    title="Close"
  >
    ✕
  </button>
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl z-10">
            <svg
              className="animate-spin h-8 w-8 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h2>
        <p className="text-gray-500 mb-8"></p>

        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Left - Avatar + Upload + Sign Out */}
          <div
            className="flex flex-col items-center md:w-1/3"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <img
              src={preview || currentUser.photoURL || "/defaultAvatar.png"}
              alt="User Avatar"
              className="w-36 h-36 rounded-lg object-cover border border-gray-200 shadow-md mb-4"
            />
            <label className="w-full bg-black text-white py-2 px-4 text-sm sm:text-base rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition duration-200 font-medium text-center cursor-pointer mb-2">
              Upload Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
            <div className="w-full text-center border-2 border-dashed border-gray-300 py-4 rounded-lg text-gray-500 text-sm hover:border-blue-400 transition mb-6">
              Drag & Drop to change Profile
            </div>
            <button
              onClick={handleSignOut}
              className="w-full bg-gray-200 text-black-800 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Sign Out
            </button>
          </div>

          {/* Right - Info */}
          <div className="flex-1">
            {editing ? (
              <>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-blue-400"
                  placeholder="Name"
                />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-3 bg-gray-100"
                  placeholder="Email"
                  disabled
                />
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-blue-400"
                  placeholder="Phone Number"
                />
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-blue-400"
                  placeholder="Address"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-gray-600 text-sm font-semibold mb-1">Name</label>
                  <div className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                    {currentUser.displayName || "Enter Name "}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-600 text-sm font-semibold mb-1">Email</label>
                  <div className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                    {currentUser.email || "Enter Email"}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-600 text-sm font-semibold mb-1">Phone</label>
                  <div className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                    {newPhone || "Enter Phone Number"}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-600 text-sm font-semibold mb-1">Address</label>
                  <div className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                    {newAddress || "Enter Address"}
                  </div>
                </div>

                <button
                  onClick={() => setEditing(true)}
                  className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition duration-200 font-medium mb-4"

                >
                  Edit Profile
                </button>
                {/* <button
                  onClick={handleDeleteAccount}
                  className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Delete Account
                </button>
                */} 
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
