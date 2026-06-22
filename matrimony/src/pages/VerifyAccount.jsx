import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PhotoManager from '../components/PhotoManager';
import { API_URL } from '../utils/api';

export default function VerifyAccount() {
    const [status, setStatus] = useState('loading');
    const [photos, setPhotos] = useState([]);
    const [profilePicUrl, setProfilePicUrl] = useState(null);

    // State for ID Proof (Using a simpler direct upload state for the ID)
    const [idProofUrls, setIdProofUrls] = useState([]);
    const [isUploadingId, setIsUploadingId] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${API_URL}/me/`, {
                    headers: { Authorization: `Token ${token}` }
                });
                setStatus(res.data.verification_status);
            } catch (err) {
                console.error("Failed to fetch status", err);
                setStatus('unverified');
            }
        };
        checkStatus();
    }, []);

    // Simplified cloud upload for the ID Proof
    const handleIdUpload = async (event) => {
        const file = event.target.files[0];
        console.log("File selected:", file); // ADD THIS

        if (!file) {
            console.log("No file detected"); // ADD THIS
            return;
        }

        setIsUploadingId(true);
        const token = localStorage.getItem('token');

        try {
            console.log("Starting upload..."); // ADD THIS
            const sigResponse = await axios.get(`${API_URL}/get-signature/`, {
                headers: { Authorization: `Token ${token}` }
            });
            console.log("Signature received:", sigResponse.data); // ADD THIS

            const { signature, timestamp, api_key, cloud_name, folder } = sigResponse.data;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', api_key);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', folder);

            const cloudinaryRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                formData
            );

            console.log("Upload successful:", cloudinaryRes.data); // ADD THIS
            setIdProofUrls([...idProofUrls, cloudinaryRes.data.secure_url]);
        } catch (error) {
            console.error("ID Upload failed:", error); // This will show the actual error
        } finally {
            setIsUploadingId(false);
        }
    };

    const handleSubmit = async () => {
        if (photos.length === 0 || idProofUrls.length === 0) {
            alert("You must upload at least one profile picture and one ID proof.");
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/complete-onboarding/`, {
                photos: photos,
                profile_pic_url: profilePicUrl,
                id_proofs: idProofUrls
            }, {
                headers: { Authorization: `Token ${token}` }
            });

            setStatus('pending');
        } catch (error) {
            console.error("Failed to submit documents", error);
        }
    };

    if (status === 'pending') {
        return (
            <div className="max-w-2xl mx-auto mt-20 p-8 bg-white dark:bg-[#1f1b18] text-center rounded-xl shadow">
                <div className="text-4xl mb-4">⏳</div>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Verification Pending</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Your documents have been securely submitted. Our admin team will review your profile shortly. Check back later!
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8 mt-10">
            <div className="bg-white dark:bg-[#1f1b18] p-6 rounded-xl shadow-card">
                <h1 className="text-2xl font-serif font-bold mb-2">Complete Your Profile</h1>
                <p className="text-gray-500 mb-6">Upload your public photos and a private ID proof to activate your account.</p>

                {/* 1. Public Profile Photos */}
                <div className="mb-8 border-b pb-8">
                    <PhotoManager
                        photos={photos}
                        setPhotos={setPhotos}
                        profilePicUrl={profilePicUrl}
                        setProfilePicUrl={setProfilePicUrl}
                    />
                </div>

                {/* 2. Private ID Proof */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verify Your Identity</h3>
                    <p className="text-sm text-gray-500">Upload a government-issued ID (Aadhar, Passport, Pan). This is strictly confidential and only visible to administrators.</p>

                    <div className="flex items-center gap-4">
                        <input type="file" accept="image/*" onChange={handleIdUpload} id="id-upload" className="hidden" />
                        <label htmlFor="id-upload" className="cursor-pointer px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
                            {isUploadingId ? 'Uploading Securely...' : 'Select ID Document'}
                        </label>
                        <span className="text-sm text-gray-500">{idProofUrls.length} document(s) uploaded</span>
                    </div>
                </div>

                <div className="mt-10 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={photos.length === 0 || idProofUrls.length === 0}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-md hover:bg-primary-600 disabled:opacity-50 transition-colors"
                    >
                        Submit for Verification
                    </button>
                </div>
            </div>
        </div>
    );
}