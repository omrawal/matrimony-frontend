import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PhotoManager from '../components/PhotoManager';
import Select from 'react-select';
import { FILTER_CAST_OPTIONS, FILTER_LOCATION_OPTIONS, generateHeightOptions } from '../utils/constants';
import { API_URL } from '../utils/api';

export default function VerifyAccount() {
    const [status, setStatus] = useState('loading');
    const [photos, setPhotos] = useState([]);
    const [step, setStep] = useState(1);
    const [profilePicUrl, setProfilePicUrl] = useState(null);

    // State for ID Proof (Using a simpler direct upload state for the ID)
    const [idProofUrls, setIdProofUrls] = useState([]);
    const [isUploadingId, setIsUploadingId] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        time_of_birth: '', place_of_birth: '', astrology: '',
        diet: '', drink: '', mother_name: '', father_name: '',
        mother_contact: '', father_contact: '', address: '',
        location: '', height: '', weight: '', complexion: '',
        cast: '', education: '', profession: ''
    });
    const HEIGHT_OPTIONS = generateHeightOptions();

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

    const handleTextChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        setStep(2);
    };

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
                ...formData,
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

    if (status === 'loading') return <div className="text-center mt-20">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6 mt-6">

            {/* Visual Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <span className={step === 1 ? 'text-primary' : ''}>1. Family Details</span>
                    <span className={step === 2 ? 'text-primary' : ''}>2. Media & ID</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-2 transition-all duration-300" style={{ width: step === 1 ? '50%' : '100%' }}></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b dark:border-[#2b2725] pb-6 mb-6">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Current City / Location *</label>
                    <Select
                        options={FILTER_LOCATION_OPTIONS}
                        onChange={(opt) => setFormData({ ...formData, location: opt.value })}
                        className="text-sm text-black" required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Height *</label>
                    <Select
                        options={HEIGHT_OPTIONS}
                        onChange={(opt) => setFormData({ ...formData, height: opt.value })}
                        className="text-sm text-black" required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Weight (kg) *</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleTextChange} required className="w-full p-2.5 rounded bg-gray-50 dark:bg-[#2b2725] dark:text-white border border-gray-200 dark:border-gray-700" />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Complexion *</label>
                    <select name="complexion" value={formData.complexion} onChange={handleTextChange} required className="w-full p-3 rounded bg-gray-50 dark:bg-[#2b2725] dark:text-white border border-gray-200 dark:border-gray-700">
                        <option value="" disabled>Select</option>
                        <option value="Fair">Fair</option>
                        <option value="Wheatish">Wheatish</option>
                        <option value="Dusky">Dusky</option>
                        <option value="Dark">Dark</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Community / Cast *</label>
                    <Select
                        options={FILTER_CAST_OPTIONS}
                        onChange={(opt) => setFormData({ ...formData, cast: opt.value })}
                        className="text-sm text-black" required
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b dark:border-[#2b2725] pb-6 mb-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Highest Education *</label>
                        <input type="text" name="education" value={formData.education} onChange={handleTextChange} placeholder="e.g., B.Tech, MBA" required className="w-full p-3 rounded bg-gray-50 dark:bg-[#2b2725] dark:text-white border border-gray-200 dark:border-gray-700" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Current Profession *</label>
                        <input type="text" name="profession" value={formData.profession} onChange={handleTextChange} placeholder="e.g., Software Engineer at Citi" required className="w-full p-3 rounded bg-gray-50 dark:bg-[#2b2725] dark:text-white border border-gray-200 dark:border-gray-700" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1f1b18] p-6 rounded-xl shadow-card border border-gray-100 dark:border-[#2b2725]">

                {/* --- STEP 1: TEXT DETAILS --- */}
                {step === 1 && (
                    <form onSubmit={handleNextStep} className="space-y-6 animate-fadeIn">
                        <div>
                            <h1 className="text-2xl font-serif font-bold mb-2 dark:text-white">Family & Background</h1>
                            <p className="text-gray-500 text-sm">Help compatible matches understand your roots and lifestyle.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Time of Birth *</label>
                                <input type="time" name="time_of_birth" value={formData.time_of_birth} onChange={handleTextChange} required className="w-full p-3 rounded bg-gray-50 dark:bg-[#2b2725] dark:text-white border border-gray-200 dark:border-gray-700" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Place of Birth *</label>
                                <input type="text" name="place_of_birth" value={formData.place_of_birth} onChange={handleTextChange} required placeholder="City, State" className="w-full p-3 rounded bg-gray-50 dark:bg-[#2b2725] dark:text-white border border-gray-200 dark:border-gray-700" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Astrological Status *</label>
                                <select name="astrology" value={formData.astrology} onChange={handleTextChange} required className="w-full p-3 rounded bg-gray-50 dark:bg-[#2b2725] dark:text-white border border-gray-200 dark:border-gray-700">
                                    <option value="" disabled>Select Status</option>
                                    <option value="None">None / Does not matter</option>
                                    <option value="Manglik">Manglik</option>
                                    <option value="Anshik Manglik">Anshik Manglik</option>
                                    <option value="Shani">Shani</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Diet *</label>
                                <select name="diet" value={formData.diet} onChange={handleTextChange} required className="w-full p-3 rounded bg-gray-50 dark:bg-[#2b2725] dark:text-white border border-gray-200 dark:border-gray-700">
                                    <option value="" disabled>Select Diet</option>
                                    <option value="Vegetarian">Vegetarian</option>
                                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                                    <option value="Eggetarian">Eggetarian</option>
                                    <option value="Jain">Jain</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Drinking *</label>
                                <select name="drink" value={formData.drink} onChange={handleTextChange} required className="w-full p-3 rounded bg-gray-50 dark:bg-[#2b2725] dark:text-white border border-gray-200 dark:border-gray-700">
                                    <option value="" disabled>Select Preference</option>
                                    <option value="Never">Never</option>
                                    <option value="Occasionally">Occasionally / Socially</option>
                                    <option value="Regularly">Regularly</option>
                                </select>
                            </div>
                            <div className="hidden md:block"></div> {/* Spacer */}

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Mother's Name *</label>
                                <input type="text" name="mother_name" value={formData.mother_name} onChange={handleTextChange} required className="w-full p-3 rounded bg-gray-50 dark:bg-[#2b2725] dark:text-white border border-gray-200 dark:border-gray-700" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Father's Name *</label>
                                <input type="text" name="father_name" value={formData.father_name} onChange={handleTextChange} required className="w-full p-3 rounded bg-gray-50 dark:bg-[#2b2725] dark:text-white border border-gray-200 dark:border-gray-700" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Mother's Contact (Optional)</label>
                                <input type="text" name="mother_contact" value={formData.mother_contact} onChange={handleTextChange} className="w-full p-3 rounded bg-gray-50 dark:bg-[#2b2725] dark:text-white border border-gray-200 dark:border-gray-700" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Father's Contact (Optional)</label>
                                <input type="text" name="father_contact" value={formData.father_contact} onChange={handleTextChange} className="w-full p-3 rounded bg-gray-50 dark:bg-[#2b2725] dark:text-white border border-gray-200 dark:border-gray-700" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Permanent Address (Optional)</label>
                                <textarea name="address" value={formData.address} onChange={handleTextChange} rows="2" className="w-full p-3 rounded bg-gray-50 dark:bg-[#2b2725] dark:text-white border border-gray-200 dark:border-gray-700" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-600 transition shadow">
                                Continue to Photos ➔
                            </button>
                        </div>
                    </form>
                )}

                {/* --- STEP 2: MEDIA & ID --- */}
                {step === 2 && (
                    <div className="space-y-8 animate-fadeIn">
                        <div>
                            <h1 className="text-2xl font-serif font-bold mb-2 dark:text-white">Media & Verification</h1>
                            <p className="text-gray-500 text-sm">Upload your public photos and a private ID proof to activate your account.</p>
                        </div>

                        <div className="border-b dark:border-gray-700 pb-8">
                            <PhotoManager photos={photos} setPhotos={setPhotos} profilePicUrl={profilePicUrl} setProfilePicUrl={setProfilePicUrl} />
                        </div>

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

                        <div className="pt-8 flex justify-between items-center border-t dark:border-gray-700">
                            <button onClick={() => setStep(1)} className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
                                ← Back to Details
                            </button>
                            <button onClick={handleSubmit} disabled={photos.length === 0 || idProofUrls.length === 0} className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition shadow">
                                Submit for Verification
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}