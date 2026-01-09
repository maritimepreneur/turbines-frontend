import Image from "next/image";
import RoleCard from "@/components/RoleCard"
import { Briefcase, Wallet, Settings } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Title */}
      <h1 className="text-3xl font-semibold italic">Turbines</h1>
      <p className="text-gray-400 mb-10">
        lorem ipsum lorem ipsum
      </p>

      {/* Cards */}
      <div className="flex gap-8">
        <RoleCard
          title="BizDev"
          color="bg-sky-500"
          icon={<Briefcase />}
        />
        <RoleCard
          title="Finance"
          color="bg-green-500"
          icon={<Wallet />}
        />
        <RoleCard
          title="Operation"
          color="bg-orange-500"
          icon={<Settings />}
        />
      </div>
    </main>
  );
}



