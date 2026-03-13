"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import {
  Mail,
  Phone,
  MapPin,
  User,
  Smartphone,
  MessageSquare,
  Calendar,
  CreditCard,
  FileText,
  Heart,
  Globe,
  Home,
  Briefcase,
  Edit,
} from "lucide-react";
import Link from "next/link";

export default function UserProfilePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profileData, setProfileData] = useState<any>(null);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/api/employees/profile');
            if (response.data?.data) {
                setProfileData(response.data.data);
            }
        } catch (err: any) {
            setError('Failed to load profile data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-600 to-blue-700 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg md:rounded-xl border-2 md:border-4 border-white shadow-xl bg-white overflow-hidden flex-shrink-0">
                    {profileData?.img_url ? (
                      <img
                        src={profileData.img_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        <User
                          size={32}
                          className="sm:w-10 sm:h-10 md:w-12 md:h-12"
                          strokeWidth={1.5}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
                      {profileData?.full_name || "Full Name"}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                      <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-lg text-xs sm:text-sm font-medium">
                        <Briefcase size={12} className="sm:w-3.5 sm:h-3.5" />
                        {profileData?.employee_code || "EMP-000"}
                      </span>
                      {profileData?.nickname && (
                        <span className="text-white/90 text-xs sm:text-sm">
                          ({profileData.nickname})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  href="/employee/profile"
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm w-full sm:w-auto justify-center"
                >
                  <Edit size={16} className="sm:w-4 sm:h-4" />
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column - Personal & Contact */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="text-white" size={16} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Personal Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InfoItem
                    icon={<Calendar className="text-blue-500" size={18} />}
                    label="Birth Date"
                    value={profileData?.birth_date}
                  />
                  <InfoItem
                    icon={<MapPin className="text-blue-500" size={18} />}
                    label="Birth Place"
                    value={profileData?.birth_place}
                  />
                  <InfoItem
                    icon={<Heart className="text-rose-500" size={18} />}
                    label="Blood Type"
                    value={profileData?.blood_type}
                  />
                  <InfoItem
                    icon={<Heart className="text-purple-500" size={18} />}
                    label="Religion"
                    value={profileData?.religion}
                  />
                  <InfoItem
                    icon={<Globe className="text-emerald-500" size={18} />}
                    label="Nationality"
                    value={profileData?.nationality}
                  />
                  <InfoItem
                    icon={<User className="text-blue-500" size={18} />}
                    label="Marital Status"
                    value={profileData?.marital_status}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="text-white" size={16} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Contact Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InfoItem
                    icon={<Mail className="text-blue-500" size={18} />}
                    label="Email"
                    value={profileData?.email}
                  />
                  <InfoItem
                    icon={
                      <MessageSquare className="text-emerald-500" size={18} />
                    }
                    label="WhatsApp"
                    value={profileData?.whatsapp}
                  />
                  <InfoItem
                    icon={<Smartphone className="text-blue-500" size={18} />}
                    label="Mobile Phone"
                    value={profileData?.handphone}
                  />
                  <InfoItem
                    icon={<Phone className="text-gray-500" size={18} />}
                    label="Office Phone"
                    value={profileData?.phone}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <Home className="text-white" size={16} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Address
                  </h2>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-blue-600" />
                      <label className="text-xs font-semibold text-blue-900 uppercase">
                        Residence Address
                      </label>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {profileData?.residence_address || "-"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-purple-600" />
                      <label className="text-xs font-semibold text-purple-900 uppercase">
                        Permanent Address
                      </label>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {profileData?.permanent_address || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Documents */}
            <div className="space-y-4 md:space-y-6">
              {/* Documents */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="text-white" size={16} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Documents
                  </h2>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <DocCard
                    icon={<CreditCard className="text-blue-500" size={20} />}
                    label="KTP"
                    value={profileData?.ktp}
                    color="blue"
                  />
                  <DocCard
                    icon={<FileText className="text-emerald-500" size={20} />}
                    label="NPWP"
                    value={profileData?.npwp}
                    color="emerald"
                  />
                  <DocCard
                    icon={<CreditCard className="text-orange-500" size={20} />}
                    label="Driving License"
                    value={profileData?.driving_license}
                    color="orange"
                  />
                </div>
              </div>

              {/* Signature */}
              {profileData?.signature_img_url && (
                <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 md:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="text-white" size={16} />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Signature
                    </h2>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200 flex items-center justify-center">
                    <img
                      src={profileData.signature_img_url}
                      alt="Signature"
                      className="max-h-16 sm:max-h-20 md:max-h-24"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
    return (
        <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
            <div className="flex-shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">{label}</label>
                <span className="text-sm text-gray-900 block break-words">{value || '-'}</span>
            </div>
        </div>
    );
}

function DocCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value?: string; color: string }) {
    const colorClasses = {
        blue: 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200',
        emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200',
        orange: 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200'
    };
    
    return (
        <div className={`${colorClasses[color as keyof typeof colorClasses]} rounded-lg sm:rounded-xl p-3 sm:p-4 border`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                {icon}
                <label className="text-xs font-semibold text-gray-700 uppercase">{label}</label>
            </div>
            <p className="text-xs sm:text-sm text-gray-900 font-mono break-all">{value || '-'}</p>
        </div>
    );
}
