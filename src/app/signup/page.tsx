import SignupForm from "@/components/SignupForm"


export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">        
        {/* Left Side - Form */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-sm p-8">
          <SignupForm />
        </div>
    </main>
  )
}
