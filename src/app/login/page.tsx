import LoginForm from "@/components/LoginForm"


export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">        
        {/* Left Side - Form */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-sm p-8">
          <LoginForm />
        </div>
    </main>
  )
}
