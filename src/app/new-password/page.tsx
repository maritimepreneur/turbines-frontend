import NewPassword from "@/components/NewPassword"

export default function NewPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-sm p-8">
          <NewPassword />
        </div>
    </main>
  )
}