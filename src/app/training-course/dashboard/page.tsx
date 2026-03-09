"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function TrainingCourseDashboard() {
    return (
        <ProtectedRoute>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Training Course Dashboard</h1>
                    <p className="text-sm text-gray-500">Overview of your training courses and progress.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Placeholder for stats cards */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-500">Total Courses</h3>
                        <p className="text-2xl font-semibold mt-2 text-slate-800">0</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-500">Active Students</h3>
                        <p className="text-2xl font-semibold mt-2 text-slate-800">0</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-500">Certificates Issued</h3>
                        <p className="text-2xl font-semibold mt-2 text-slate-800">0</p>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
