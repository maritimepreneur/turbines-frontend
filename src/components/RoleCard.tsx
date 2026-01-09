type RoleCardProps = {
  title: string
  color: string
  icon: React.ReactNode
}

export default function RoleCard({ title, color, icon }: RoleCardProps) {
  return (
    <div className="w-48 rounded-xl shadow-md bg-white overflow-hidden hover:scale-105 transition">
      <div className={`h-20 flex items-center justify-center ${color}`}>
        <div className="text-white text-3xl">{icon}</div>
      </div>
      <div className="py-4 text-blue-400 text-center font-medium">{title}</div>
    </div>
  )
}
