'use client'

import GForm from '@/components/forms/GForm'

export default function GFormPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Training Course / GForm / <span className="text-slate-600">Add</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Add GForm</h1>
      </div>
      <div className="max-w-4xl">
        <GForm />
      </div>
    </div>
  )
}
