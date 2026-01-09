import ForgotPassword from "@/components/ForgotPassword"


export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">        
        {/* Left Side - Form */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-sm p-8">
          <ForgotPassword />
        </div>
    </main>
  )
}
