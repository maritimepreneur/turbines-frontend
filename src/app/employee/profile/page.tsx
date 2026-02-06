"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

type EmployeeData = {
    full_name: string;
    nickname: string;
    residence_address: string;
    permanent_address: string;
    birth_place: string;
    birth_date: string;
    religion: "ISLAM" | "CHRISTIAN" | "CATHOLIC" | "HINDU" | "BUDDHA" | "CONFUCIUS" | "OTHER";
    blood_type: "APLUS" | "AMINUS" | "BPLUS" | "BMINUS" | "ABPLUS" | "ABMINUS" | "OPLUS" | "OMINUS";
    nationality: string;
    marital_status: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
    ktp: string;
    driving_license: string;
    npwp: string;
    phone: string;
    whatsapp: string;
    email: string;
    handphone: string;
    employee_code: string;
    img_url: string;
    signature_img_url: string;
    signature_scale: number;
};

export default function EmployeeProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<EmployeeData>({
        full_name: "",
        nickname: "",
        residence_address: "",
        permanent_address: "",
        birth_place: "",
        birth_date: "",
        religion: "ISLAM",
        blood_type: "APLUS",
        nationality: "",
        marital_status: "SINGLE",
        ktp: "",
        driving_license: "",
        npwp: "",
        phone: "",
        whatsapp: "",
        email: "",
        handphone: "",
        employee_code: "",
        img_url: "",
        signature_img_url: "",
        signature_scale: 1,
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "signature_scale" ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axiosInstance.post("/api/employees/create", formData);

            if (response.data.code === 200 || response.data.code === 201) {
                alert("Employee profile created successfully!");
                // Reset form or redirect
                setFormData({
                    full_name: "",
                    nickname: "",
                    residence_address: "",
                    permanent_address: "",
                    birth_place: "",
                    birth_date: "",
                    religion: "ISLAM",
                    blood_type: "APLUS",
                    nationality: "",
                    marital_status: "SINGLE",
                    ktp: "",
                    driving_license: "",
                    npwp: "",
                    phone: "",
                    whatsapp: "",
                    email: "",
                    handphone: "",
                    employee_code: "",
                    img_url: "",
                    signature_img_url: "",
                    signature_scale: 1,
                });
            } else {
                throw new Error(response.data.message || "Failed to create profile");
            }
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            if (error.response?.data?.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert("Failed to create employee profile. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-black">Employee Profile</h1>
                    <p className="text-black mt-2">Create new employee profile</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Photo Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-black mb-6">Profile Photo</h2>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            {/* Photo Preview */}
                            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-sky-100">
                                {formData.img_url ? (
                                    <img
                                        src={formData.img_url}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <svg
                                        className="w-20 h-20 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                )}
                            </div>

                            {/* Photo URL Input */}
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-black mb-2">
                                    Profile Image URL
                                </label>
                                <input
                                    type="text"
                                    name="img_url"
                                    value={formData.img_url}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                    placeholder="https://example.com/photo.jpg"
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    Enter a valid image URL to display your profile photo
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-black mb-6">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Nickname</label>
                                <input
                                    type="text"
                                    name="nickname"
                                    value={formData.nickname}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                    placeholder="John"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Birth Place <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="birth_place"
                                    value={formData.birth_place}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                    placeholder="Jakarta"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Birth Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Religion <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="religion"
                                    value={formData.religion}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black bg-white"
                                >
                                    <option value="ISLAM">Islam</option>
                                    <option value="CHRISTIAN">Christian</option>
                                    <option value="CATHOLIC">Catholic</option>
                                    <option value="HINDU">Hindu</option>
                                    <option value="BUDDHA">Buddha</option>
                                    <option value="CONFUCIUS">Confucius</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Blood Type</label>
                                <select
                                    name="blood_type"
                                    value={formData.blood_type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black bg-white"
                                >
                                    <option value="APLUS">A+</option>
                                    <option value="AMINUS">A-</option>
                                    <option value="BPLUS">B+</option>
                                    <option value="BMINUS">B-</option>
                                    <option value="ABPLUS">AB+</option>
                                    <option value="ABMINUS">AB-</option>
                                    <option value="OPLUS">O+</option>
                                    <option value="OMINUS">O-</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Nationality <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                    placeholder="Indonesian"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Marital Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="marital_status"
                                    value={formData.marital_status}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black bg-white"
                                >
                                    <option value="SINGLE">Single</option>
                                    <option value="MARRIED">Married</option>
                                    <option value="DIVORCED">Divorced</option>
                                    <option value="WIDOWED">Widowed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Address Information Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-black mb-6">Address Information</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Residence Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="residence_address"
                                    value={formData.residence_address}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black resize-none"
                                    placeholder="Enter current residence address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Permanent Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="permanent_address"
                                    value={formData.permanent_address}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black resize-none"
                                    placeholder="Enter permanent address"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-black mb-6">Contact Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                    placeholder="021-1234567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Mobile Phone</label>
                                <input
                                    type="text"
                                    name="handphone"
                                    value={formData.handphone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                    placeholder="08123456789"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">WhatsApp Number</label>
                                <input
                                    type="text"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                    placeholder="08123456789"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Document Information Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-black mb-6">Document Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Employee Code</label>
                                <input
                                    type="text"
                                    name="employee_code"
                                    value={formData.employee_code}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                    placeholder="EMP001"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">KTP Number</label>
                                <input
                                    type="text"
                                    name="ktp"
                                    value={formData.ktp}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                    placeholder="3174012345678901"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Driving License</label>
                                <input
                                    type="text"
                                    name="driving_license"
                                    value={formData.driving_license}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                    placeholder="SIM123456789"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">NPWP Number</label>
                                <input
                                    type="text"
                                    name="npwp"
                                    value={formData.npwp}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                    placeholder="12.345.678.9-012.000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Signature Information Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-black mb-6">Signature Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Signature Image URL</label>
                                <input
                                    type="text"
                                    name="signature_img_url"
                                    value={formData.signature_img_url}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                    placeholder="https://example.com/signature.png"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Signature Scale</label>
                                <input
                                    type="number"
                                    name="signature_scale"
                                    value={formData.signature_scale}
                                    onChange={handleInputChange}
                                    step="0.1"
                                    min="0.1"
                                    max="10"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-black"
                                    placeholder="1.0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 bg-white rounded-xl shadow-sm p-6">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-black font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-sky-500/30"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating Profile...
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    Create Profile
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
