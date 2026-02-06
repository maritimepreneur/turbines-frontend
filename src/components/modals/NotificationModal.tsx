"use client";

import { useEffect } from "react";

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: "success" | "error" | "info";
    autoClose?: boolean;
    autoCloseDelay?: number;
}

export function NotificationModal({
    isOpen,
    onClose,
    title,
    message,
    type = "success",
    autoClose = true,
    autoCloseDelay = 3000,
}: NotificationModalProps) {
    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, autoCloseDelay, onClose]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getColors = () => {
        switch (type) {
            case "success":
                return {
                    icon: "text-green-600",
                    bg: "bg-green-100",
                    border: "border-green-500",
                };
            case "error":
                return {
                    icon: "text-red-600",
                    bg: "bg-red-100",
                    border: "border-red-500",
                };
            default:
                return {
                    icon: "text-sky-600",
                    bg: "bg-sky-100",
                    border: "border-sky-500",
                };
        }
    };

    const colors = getColors();

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pointer-events-none">
            {/* Notification Card */}
            <div
                className={`bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 pointer-events-auto border-l-4 ${colors.border} animate-slideDown`}
            >
                <div className="p-4">
                    <div className="flex items-start gap-3">
                        <div className={`${colors.bg} rounded-full p-2 flex-shrink-0`}>
                            {type === "success" ? (
                                <svg
                                    className={`w-5 h-5 ${colors.icon}`}
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
                            ) : type === "error" ? (
                                <svg
                                    className={`w-5 h-5 ${colors.icon}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className={`w-5 h-5 ${colors.icon}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1 pt-0.5">
                            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                            <p className="text-sm text-slate-600 mt-0.5">{message}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition flex-shrink-0"
                        >
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Progress bar for auto-close */}
                {autoClose && (
                    <div className="h-1 bg-slate-100 overflow-hidden rounded-b-xl">
                        <div
                            className={`h-full ${type === "success"
                                    ? "bg-green-500"
                                    : type === "error"
                                        ? "bg-red-500"
                                        : "bg-sky-500"
                                } animate-shrink`}
                            style={{ animationDuration: `${autoCloseDelay}ms` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
