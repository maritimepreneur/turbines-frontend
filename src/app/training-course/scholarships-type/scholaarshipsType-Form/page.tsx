"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScholarshipTypeFormPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name,
      description,
    };

    console.log("Submitted:", data);

    router.push("/training-course/scholarship-type");
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">
        Add Scholarship Type
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            className="w-full border rounded p-2 mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Scholarship type name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Description
          </label>
          <textarea
            className="w-full border rounded p-2 mt-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
        </div>

        <div className="flex gap-2 pt-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>

      </form>
    </div>
  );
}