import Image from "next/image";
import RoleCard from "@/components/RoleCard"
import { Briefcase, Wallet, Settings } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-0">
      {/* Title */}
      <h1 className="text-3xl font-semibold italic text-black">Turbines</h1>
      <p className="text-black mb-10">
        lorem ipsum lorem ipsum
      </p>

      {/* Cards */}
      <div className="flex
    flex-col        /* MOBILE: vertikal */
    sm:flex-row     /* DESKTOP: horizontal */
    gap-6
    w-full
    max-w-5xl
    justify-center
    items-stretch   /* BIAR FULL WIDTH MOBILE */
">
        <RoleCard
        title="BizDev"
        color="bg-sky-500"
        textColor="text-sky-500"
        icon={<Briefcase size={20} />}
        />

        <RoleCard
        title="Finance"
        color="bg-green-500"
        textColor="text-green-500"
        icon={<Wallet size={20} />}
        />

        <RoleCard
        title="Operation"
        color="bg-orange-500"
        textColor="text-orange-500"
        icon={<Settings size={20} />}
        />
      </div>
    </main>
  );
}



