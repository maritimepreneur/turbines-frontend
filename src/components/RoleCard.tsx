type RoleCardProps = {
  title: string
  color: string
  textColor: string
  icon: React.ReactNode
}

export default function RoleCard({
  title,
  color,
  textColor,
  icon,
}: RoleCardProps) {
  return (
    <div
      className="
        w-full 
        sm:w-44 
        md:w-48
        rounded-xl 
        bg-white 
        overflow-hidden 
        shadow-md 
        transition-all 
        duration-200 
        hover:shadow-lg 
        hover:-translate-y-1
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
        className={`
          py-3 
          sm:py-4 
          text-center 
          font-medium 
          ${textColor}
          text-sm
          sm:text-base
        `}
      >
        {title}
      </div>
    </div>
  )
}
