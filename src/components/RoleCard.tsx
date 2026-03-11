import Link from "next/link"

type RoleCardProps = {
  title: string
  color: string
  textColor: string
  icon: React.ReactNode
  href: string
}

export default function RoleCard({
  title,
  color,
  textColor,
  icon,
  href,
}: RoleCardProps) {
  return (
    <Link
      href={href}
      className="
        block
        w-full 
        sm:w-44 
        md:w-48
        rounded-[14px]
        bg-white/50
        backdrop-blur-xl
        overflow-hidden 
        shadow-md 
        transition-all 
        duration-300 
        ease-in-out
        hover:shadow-xl 
        hover:-translate-y-1.5
        hover:scale-105
        hover:bg-white/80
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-sky-400
        border
        border-white/30
      "
    >
      {/* Header */}
      <div
        className={`
          flex items-center justify-center 
          ${color}
          h-16 
          sm:h-18 
          md:h-20
        `}
      >
        {/* Icon wrapper */}
        <div
          className="
            bg-white rounded-md 
            flex items-center justify-center 
            shadow-sm
            w-8 h-8
            sm:w-9 sm:h-9
            md:w-10 md:h-10
          "
        >
          <div className={`${textColor} text-sm sm:text-base`}>
            {icon}
          </div>
        </div>
      </div>

      {/* Title */}
      <div
        className="
          py-3 
          sm:py-4 
          text-center 
          font-semibold
          text-gray-800
          text-base
          sm:text-lg
        "
      >
        {title}
      </div>
    </Link>
  )
}
