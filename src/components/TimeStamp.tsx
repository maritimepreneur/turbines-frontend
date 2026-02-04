interface TimeStampProps {
  currentTime: Date;
}

export default function TimeStamp({ currentTime }: TimeStampProps) {
  return (
    <>
      {/* Time */}
      <div className="mb-3">
        <div className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent mb-1 tracking-tight">
          {currentTime.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          WIB
        </div>
      </div>

      {/* Date */}
      <div className="flex items-center justify-center gap-2 text-slate-600">
        <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-300"></div>
        <p className="text-sm font-medium">
          {currentTime.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-300"></div>
      </div>
    </>
  );
}
