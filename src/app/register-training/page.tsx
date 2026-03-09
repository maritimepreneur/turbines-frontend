"use client";

import React, { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";

const pendidikanOptions = [
  { value: "", label: "-- Pilih Pendidikan --" },
  { value: "sd", label: "SD" },
  { value: "smp", label: "SMP" },
  { value: "sma", label: "SMA / SMK" },
  { value: "d3", label: "D3" },
  { value: "d4", label: "D4" },
  { value: "s1", label: "S1" },
  { value: "s2", label: "S2" },
  { value: "s3", label: "S3" },
];

export default function RegisterTrainingPage() {
  const [formData, setFormData] = useState({
    batchNumber: "",
    email: "",
    fullName: "",
    whatsapp: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    alamatKtp: "",
    domisili: "",
    pendidikanTerakhir: "",
    prodi: "",
    agreeTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-sm w-full text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Pendaftaran Diterima!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Terima kasih <strong className="text-gray-700">{formData.fullName}</strong>. Kami akan
            menghubungi Anda melalui WhatsApp atau email{" "}
            <strong className="text-gray-700">{formData.email}</strong> dalam 1×24 jam kerja.
          </p>
          <Link
            href="/"
            className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex flex-col items-center text-center">
          <Image
            src="/turbines_logo.jpeg"
            alt="Turbines Logo"
            width={56}
            height={56}
            className="rounded-xl mb-4"
          />
          <h1 className="text-xl font-bold text-gray-800">Registration Training Course</h1>
          <p className="text-sm text-gray-400 mt-1">PT. Turbines Maritime</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">

          {/* Batch Number */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Batch Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
              required
              placeholder="Contoh: Batch 01 / 2025"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-50 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="email@contoh.com"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-50 transition"
            />
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Nama lengkap sesuai KTP"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-50 transition"
            />
          </div>

          {/* Nomor WhatsApp */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              required
              placeholder="+62 812 xxxx xxxx"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-50 transition"
            />
          </div>

          {/* Tempat & Tanggal Lahir */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tempat Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tempatLahir"
                value={formData.tempatLahir}
                onChange={handleChange}
                required
                placeholder="Kota lahir"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-50 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggalLahir"
                value={formData.tanggalLahir}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-50 transition"
              />
            </div>
          </div>

          {/* Jenis Kelamin */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Jenis Kelamin <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6 mt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="radio"
                  name="jenisKelamin"
                  value="L"
                  checked={formData.jenisKelamin === "L"}
                  onChange={handleChange}
                  required
                  className="accent-sky-500 w-4 h-4"
                />
                Laki-laki
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="radio"
                  name="jenisKelamin"
                  value="P"
                  checked={formData.jenisKelamin === "P"}
                  onChange={handleChange}
                  className="accent-sky-500 w-4 h-4"
                />
                Perempuan
              </label>
            </div>
          </div>

          {/* Alamat KTP */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Alamat KTP <span className="text-red-500">*</span>
            </label>
            <textarea
              name="alamatKtp"
              value={formData.alamatKtp}
              onChange={handleChange}
              required
              rows={2}
              placeholder="Alamat sesuai KTP"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-50 transition resize-none"
            />
          </div>

          {/* Domisili */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Domisili <span className="text-red-500">*</span>
            </label>
            <textarea
              name="domisili"
              value={formData.domisili}
              onChange={handleChange}
              required
              rows={2}
              placeholder="Alamat domisili saat ini"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-50 transition resize-none"
            />
          </div>

          {/* Pendidikan Terakhir & Prodi */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Pendidikan Terakhir <span className="text-red-500">*</span>
              </label>
              <select
                name="pendidikanTerakhir"
                value={formData.pendidikanTerakhir}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-50 transition bg-white"
              >
                {pendidikanOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Program Studi / Prodi
              </label>
              <input
                type="text"
                name="prodi"
                value={formData.prodi}
                onChange={handleChange}
                placeholder="Contoh: Teknik Mesin"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-50 transition"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 pt-2" />

          {/* Terms */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-0.5 accent-sky-500 w-4 h-4 flex-shrink-0"
            />
            <span className="text-xs text-gray-500 leading-relaxed">
              Saya menyetujui{" "}
              <Link href="#" className="text-sky-500 hover:underline">Syarat & Ketentuan</Link>{" "}
              dan{" "}
              <Link href="#" className="text-sky-500 hover:underline">Kebijakan Privasi</Link>{" "}
              PT. Turbines Maritime.
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !formData.agreeTerms}
            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Memproses...
              </>
            ) : (
              "Daftar Sekarang"
            )}
          </button>

          <p className="text-center text-xs text-gray-400 pb-2">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-sky-500 font-medium hover:underline">
              Masuk
            </Link>
          </p>

        </form>
      </div>
    </main>
  );
}
