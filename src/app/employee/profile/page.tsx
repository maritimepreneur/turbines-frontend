'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

interface EmployeeProfile {
    id?: number;
    full_name: string;
    nickname: string;
    employee_code: string;
    email: string;
    phone: string;
    handphone: string;
    whatsapp: string;
    birth_place: string;
    birth_date: string;
    blood_type: string;
    religion: string;
    nationality: string;
    marital_status: string;
    ktp: string;
    driving_license: string;
    npwp: string;
    residence_address: string;
    permanent_address: string;
    img_url?: string;
    signature_img_url?: string;
    signature_scale?: number;
}

const bloodTypeOptions = [
    { label: 'A+', value: 'APLUS' },
    { label: 'A-', value: 'AMIN' },
    { label: 'B+', value: 'BPLUS' },
    { label: 'B-', value: 'BMIN' },
    { label: 'AB+', value: 'ABPLUS' },
    { label: 'AB-', value: 'ABMIN' },
    { label: 'O+', value: 'OPLUS' },
    { label: 'O-', value: 'OMIN' }
];
const religionOptions = ['ISLAM', 'CHRISTIANITY', 'HINDUISM', 'BUDDHISM', 'CONFUCIANISM', 'OTHER'];
const maritalStatusOptions = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED'];

export default function EmployeeProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [employeeId, setEmployeeId] = useState<number | null>(null);

    const [profileData, setProfileData] = useState<EmployeeProfile>({
        full_name: '',
        nickname: '',
        employee_code: '',
        email: '',
        phone: '',
        handphone: '',
        whatsapp: '',
        birth_place: '',
        birth_date: '',
        blood_type: '',
        religion: '',
        nationality: '',
        marital_status: '',
        ktp: '',
        driving_license: '',
        npwp: '',
        residence_address: '',
        permanent_address: '',
        signature_scale: 1,
    });

    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const convertDateToBackendFormat = (dateStr: string): string => {
        if (!dateStr) return '';
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateStr;
        }
        if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            const [day, month, year] = dateStr.split('/');
            return `${year}-${month}-${day}`;
        }
        return dateStr;
    };

    const formatDateForInput = (dateStr: string): string => {
        if (!dateStr) return '';
        const datePart = dateStr.split('T')[0];
        if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return datePart;
        }
        return '';
    };

    const convertBloodTypeFromAPI = (apiBloodType: string): string => {
        const mapping: { [key: string]: string } = {
            'A+': 'APLUS',
            'A-': 'AMIN',
            'B+': 'BPLUS',
            'B-': 'BMIN',
            'AB+': 'ABPLUS',
            'AB-': 'ABMIN',
            'O+': 'OPLUS',
            'O-': 'OMIN'
        };
        return mapping[apiBloodType] || apiBloodType;
    };

    const convertBloodTypeToAPI = (formBloodType: string): string => {
        const mapping: { [key: string]: string } = {
            'APLUS': 'A+',
            'AMIN': 'A-',
            'BPLUS': 'B+',
            'BMIN': 'B-',
            'ABPLUS': 'AB+',
            'ABMIN': 'AB-',
            'OPLUS': 'O+',
            'OMIN': 'O-'
        };
        return mapping[formBloodType] || formBloodType;
    };

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get('/api/employees/profile');

                console.log('API Response:', response.data);

                if (response.data && response.data.data) {
                    const myProfile = response.data.data;
                    console.log('Found profile - Employee Code:', myProfile.employee_code);
                    console.log('Full profile data:', myProfile);

                    setEmployeeId(myProfile.id);

                    const mappedData: EmployeeProfile = {
                        full_name: myProfile.full_name || '',
                        nickname: myProfile.nickname || '',
                        employee_code: myProfile.employee_code || '',
                        email: myProfile.email || '',
                        phone: myProfile.phone || '',
                        handphone: myProfile.handphone || '',
                        whatsapp: myProfile.whatsapp || '',
                        birth_place: myProfile.birth_place || '',
                        birth_date: formatDateForInput(myProfile.birth_date || ''),
                        blood_type: convertBloodTypeFromAPI(myProfile.blood_type || ''),
                        religion: myProfile.religion || '',
                        nationality: myProfile.nationality || '',
                        marital_status: myProfile.marital_status || '',
                        ktp: myProfile.ktp || '',
                        driving_license: myProfile.driving_license || '',
                        npwp: myProfile.npwp || '',
                        residence_address: myProfile.residence_address || '',
                        permanent_address: myProfile.permanent_address || '',
                        img_url: myProfile.img_url || '',
                        signature_img_url: myProfile.signature_img_url || '',
                        signature_scale: myProfile.signature_scale || 1,
                        id: myProfile.id
                    };

                    console.log('Mapped data being set to state:', mappedData);
                    setProfileData(mappedData);

                    if (myProfile.img_url) {
                        setImagePreview(myProfile.img_url);
                    }
                }
            } catch (err: any) {
                console.log('No profile found (normal for new users)');
                console.log('Error details:', err.response?.status, err.response?.data);
            }

        } catch (err: any) {
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file (JPG or PNG)');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                alert('Image size must be less than 2MB');
                return;
            }

            setProfileImage(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profileData.full_name.trim() || !profileData.email.trim()) {
            setError('Full Name and Email are required');
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            setSuccessMessage(null);

            console.log('Saving... Employee ID:', employeeId);

            const formattedBirthDate = convertDateToBackendFormat(profileData.birth_date) || '2000-01-01';

            const payload: any = {
                full_name: profileData.full_name.trim(),
                nickname: profileData.nickname?.trim() || profileData.full_name.trim(),
                email: profileData.email.trim(),
                residence_address: profileData.residence_address?.trim() || '-',
                permanent_address: profileData.permanent_address?.trim() || '-',
                birth_place: profileData.birth_place?.trim() || '-',
                birth_date: formattedBirthDate,
                religion: profileData.religion || 'ISLAM',
                blood_type: profileData.blood_type || 'OPLUS',
                nationality: profileData.nationality?.trim() || 'Indonesian',
                marital_status: profileData.marital_status || 'SINGLE',
                ktp: profileData.ktp?.trim() || '-',
                driving_license: profileData.driving_license?.trim() || '-',
                npwp: profileData.npwp?.trim() || '-',
                phone: profileData.phone?.trim() || '-',
                whatsapp: profileData.whatsapp?.trim() || '-',
                handphone: profileData.handphone?.trim() || '-',
                img_url: profileData.img_url || '',
                signature_img_url: profileData.signature_img_url || '',
                signature_scale: profileData.signature_scale || 1
            };

            if (employeeId && profileData.employee_code) {
                payload.employee_code = profileData.employee_code;
            }

            console.log('Payload:', payload);
            console.log('Birth date formatted:', formattedBirthDate);

            let response;

            if (employeeId) {
                console.log('PUT /api/employees/' + employeeId);
                response = await axiosInstance.put(`/api/employees/${employeeId}`, payload);
            } else {
                console.log('POST /api/employees/create');
                response = await axiosInstance.post('/api/employees/create', payload);
            }

            console.log('Response:', response.data);

            const savedData = response.data;

            setSuccessMessage('Profile saved successfully!');

            if (!employeeId && savedData.id) {
                setEmployeeId(savedData.id);
            }

            if (savedData.employee_code) {
                console.log('Employee Code:', savedData.employee_code);
                setProfileData(prev => ({
                    ...prev,
                    employee_code: savedData.employee_code,
                    id: savedData.id
                }));
            }

            setTimeout(() => fetchProfile(), 500);
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (err: any) {
            console.error('Save error:', err);

            if (err.message === 'Network Error') {
                setError('Network error. Cannot connect to server.');
            } else if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
                setTimeout(() => router.push('/login'), 2000);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to save profile. Please try again.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div>
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-black">Employee Profile</h1>
                    <p className="text-sm text-slate-400 mt-1">Update your professional and personal identity.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-600">Loading profile data...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-black">Employee Profile</h1>
                <p className="text-sm text-slate-400 mt-1">Update your professional and personal identity.</p>
            </div>

            <form onSubmit={handleSubmit}>

                <div className="bg-white rounded-xl shadow-sm p-6 text-black">
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-green-700">{successMessage}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-red-700">{error}</span>
                        </div>
                    )}

                    <div className="flex items-start justify-between mb-8">
                        <h2 className="text-xl font-semibold text-black border-l-4 border-emerald-500 pl-3">Profile Detail</h2>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mb-8 flex justify-center">
                        <div className="text-center">
                            <div className="relative inline-block">
                                <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-slate-200">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                </div>

                                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-indigo-700 transition shadow-lg">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-slate-500 mt-3">
                                Format <span className="font-medium">JPG/PNG</span> • Max <span className="font-medium">2MB</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="full_name"
                                value={profileData.full_name}
                                onChange={handleInputChange}
                                placeholder="Enter full name"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-2">
                                Nickname
                            </label>
                            <input
                                type="text"
                                name="nickname"
                                value={profileData.nickname}
                                onChange={handleInputChange}
                                placeholder="Preferred name"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-2">
                                Employee Code
                            </label>
                            <input
                                type="text"
                                value={profileData.employee_code || 'Auto-generated'}
                                readOnly
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-400 mt-1">
                                {employeeId ? `✓ ${profileData.employee_code}` : 'Will be generated after saving'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={profileData.email}
                                onChange={handleInputChange}
                                placeholder="name@company.com"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={profileData.phone}
                                onChange={handleInputChange}
                                placeholder="+62 21..."
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Handphone</label>
                            <input
                                type="text"
                                name="handphone"
                                value={profileData.handphone}
                                onChange={handleInputChange}
                                placeholder="+62 812..."
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-2">WhatsApp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                value={profileData.whatsapp}
                                onChange={handleInputChange}
                                placeholder="Active WhatsApp number"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6 mb-6">
                        <h3 className="text-lg font-semibold text-black mb-4 border-l-4 border-emerald-500 pl-3">
                            Personal Information
                        </h3>

                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Place of Birth</label>
                                <input
                                    type="text"
                                    name="birth_place"
                                    value={profileData.birth_place}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Jakarta"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Date of Birth</label>
                                <input
                                    type="date"
                                    name="birth_date"
                                    value={profileData.birth_date}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Blood Type</label>
                                <select
                                    name="blood_type"
                                    value={profileData.blood_type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Type</option>
                                    {bloodTypeOptions.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Religion</label>
                                <select
                                    name="religion"
                                    value={profileData.religion}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Religion</option>
                                    {religionOptions.map(religion => (
                                        <option key={religion} value={religion}>{religion}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Nationality</label>
                                <input
                                    type="text"
                                    name="nationality"
                                    value={profileData.nationality}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Marital Status</label>
                                <select
                                    name="marital_status"
                                    value={profileData.marital_status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Status</option>
                                    {maritalStatusOptions.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-2">KTP</label>
                                <input
                                    type="text"
                                    name="ktp"
                                    value={profileData.ktp}
                                    onChange={handleInputChange}
                                    placeholder="16-digit ID"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-2">NPWP</label>
                                <input
                                    type="text"
                                    name="npwp"
                                    value={profileData.npwp}
                                    onChange={handleInputChange}
                                    placeholder="Tax ID"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Driving License</label>
                                <input
                                    type="text"
                                    name="driving_license"
                                    value={profileData.driving_license}
                                    onChange={handleInputChange}
                                    placeholder="License number"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-lg font-semibold text-black mb-4 border-l-4 border-emerald-500 pl-3">
                            Address Information
                        </h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Current Address</label>
                                <textarea
                                    name="residence_address"
                                    value={profileData.residence_address}
                                    onChange={handleInputChange}
                                    placeholder="Current residential address"
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Permanent Address</label>
                                <textarea
                                    name="permanent_address"
                                    value={profileData.permanent_address}
                                    onChange={handleInputChange}
                                    placeholder="Address as per KTP"
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}