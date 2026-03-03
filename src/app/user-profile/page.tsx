"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import {
    Mail, Phone, ShieldCheck, MapPin, User,
    Smartphone, MessageSquare, Anchor, Waves, Ship,
    Briefcase, LayoutGrid,
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    const displayAddress = profileData?.residence_address || profileData?.current_address || profileData?.address || '-';

    return (
        <div className="min-h-full bg-slate-50/50">
            {/* HEADER */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Anchor size={14} className="text-cyan-600" />
                        <p className="text-xs font-bold tracking-widest uppercase">Maritime Services</p>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                        <Ship size={20} className="text-cyan-600" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: IDENTITY CARD */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-cyan-900/5 border border-cyan-100/50 overflow-hidden sticky top-24">
                        {/* Sea Blue Gradient Header */}
                        <div className="h-44 bg-gradient-to-br from-cyan-500 via-blue-600 to-teal-500 relative">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/waves.png')]"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            <div className="absolute top-4 right-6 opacity-20">
                                <Anchor size={80} className="text-white rotate-12" />
                            </div>
                        </div>

                        <div className="px-8 pb-10 text-center -mt-20 relative">
                            {/* Avatar */}
                            <div className="group relative inline-block">
                                <div className="w-40 h-40 mx-auto rounded-[2.5rem] border-[8px] border-white shadow-2xl bg-cyan-50 overflow-hidden mb-6 transform transition-transform group-hover:scale-105 group-hover:rotate-2">
                                    {profileData?.img_url ? (
                                        <img src={profileData.img_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-cyan-200 bg-cyan-50/30">
                                            <User size={80} strokeWidth={1.5} />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-lg border border-cyan-100 flex items-center justify-center text-cyan-600">
                                    <Waves size={24} />
                                </div>
                            </div>

                            {/* Name */}
                            <h2 className="text-2xl font-black text-slate-800 leading-tight tracking-tight">
                                {profileData?.full_name || 'Full Name'}
                            </h2>

                            {/* Employee Code + Divisi + Role — sejajar */}
                            <div className="mt-4 flex flex-col items-center gap-2">
                                {/* EMP Code */}
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-100 rounded-2xl group hover:bg-cyan-600 transition-colors">
                                    <Anchor size={12} className="text-cyan-600 group-hover:text-white transition-colors" />
                                    <span className="text-cyan-700 font-black text-[10px] uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                                        {profileData?.employee_code || 'EMP-000'}
                                    </span>
                                </div>

                                {/* Divisi & Role sejajar di bawah EMP code */}
                                <div className="flex items-center gap-2 flex-wrap justify-center">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl">
                                        <LayoutGrid size={11} className="text-indigo-500" />
                                        <span className="text-indigo-600 font-bold text-[11px]">
                                            {profileData?.division || '-'}
                                        </span>
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-xl">
                                        <Briefcase size={11} className="text-purple-500" />
                                        <span className="text-purple-600 font-bold text-[11px]">
                                            {profileData?.role || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-10 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></div>
                        <div className="flex flex-col">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personal Identity</h3>
                            <p className="text-slate-500 font-medium text-sm">Maintained by Turbines Maritime Systems.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">

                        {/* Contact Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoBox
                                label="Fleet Email"
                                value={profileData?.email}
                                icon={<Mail className="text-cyan-500" size={18} />}
                            />
                            <InfoBox
                                label="Navigation Bridge (WA)"
                                value={profileData?.whatsapp}
                                icon={<MessageSquare className="text-blue-500" size={18} />}
                            />
                            <InfoBox
                                label="Vessel Phone"
                                value={profileData?.handphone}
                                icon={<Smartphone className="text-teal-500" size={18} />}
                            />
                            <InfoBox
                                label="On-Board Ext"
                                value={profileData?.phone}
                                icon={<Phone className="text-slate-500" size={18} />}
                            />
                        </div>

                        {/* Address Section */}
                        <div className="bg-white p-6 rounded-[2rem] border border-cyan-50 shadow-sm relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-5 text-cyan-600 group-hover:scale-110 transition-transform">
                                <Anchor size={120} />
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin size={16} className="text-cyan-600" />
                                <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                                    Home Port / Residence Address
                                </label>
                            </div>
                            <div className="bg-cyan-50/30 p-4 rounded-2xl border border-cyan-50 min-h-[70px] backdrop-blur-sm">
                                <p className="text-slate-600 text-sm leading-relaxed font-semibold">{displayAddress}</p>
                            </div>
                        </div>

                        {/* Maritime Notice */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2rem] p-8 text-white flex items-center gap-8 shadow-xl shadow-blue-200">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/30">
                                <ShieldCheck size={44} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Anchor size={16} className="text-white/80" />
                                    <h4 className="font-black text-lg tracking-tight">Security Clearance Active</h4>
                                </div>
                                <p className="text-white/90 text-sm mt-1 leading-relaxed font-medium">
                                    Your contact and port data is protected under maritime security protocols.
                                    Update requests must go through{' '}
                                    <Link href="/employee/profile" className="text-white font-black hover:underline underline-offset-4 decoration-2">
                                        Employee Central
                                    </Link>.
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <Waves size={64} className="text-white/20 animate-pulse" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoBox({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="bg-white p-6 rounded-[1.8rem] border border-slate-100 shadow-sm group hover:border-cyan-200 hover:shadow-md transition-all">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block group-hover:text-cyan-500 transition-colors">
                {label}
            </label>
            <div className="flex items-center gap-4 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-50 group-hover:bg-cyan-50/30 transition-all">
                <div className="shrink-0 group-hover:scale-110 transition-transform">{icon}</div>
                <span className="text-slate-700 font-bold text-sm truncate">{value || '-'}</span>
            </div>
        </div>
    );
}