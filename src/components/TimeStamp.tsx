interface TimeStampProps {
  currentTime: Date;
}

function getTimeOfDay(date: Date): string {
  const hour = parseInt(date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: "Asia/Jakarta"
  }));

  if (hour >= 4 && hour < 11) return "Pagi";
  if (hour >= 11 && hour < 15) return "Siang";
  if (hour >= 15 && hour < 18) return "Sore";
  return "Malam";
}

export default function TimeStamp({ currentTime }: TimeStampProps) {
  const timeHM = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  const seconds = currentTime.toLocaleTimeString("id-ID", {
    second: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  const timeOfDay = getTimeOfDay(currentTime);

  return (
    <>
      {/* Time */}
      <div className="mb-3 flex flex-col items-center">
        <div className="flex items-start gap-2">
          <span className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">
            {timeHM.replace('.', ':')}
          </span>

          <span className="text-sm font-semibold text-slate-400 mt-2">
            {seconds}
          </span>
        </div>

        <div className="mt-1 text-sm font-medium text-slate-500 tracking-wide">
          {timeOfDay} · WIB
        </div>
      </div>

      {/* Date */}
      <div className="flex items-center justify-center gap-3 text-slate-600">
        <div className="h-px w-10 bg-gradient-to-r from-transparent to-slate-300" />
        <p className="text-sm font-medium capitalize">
          {currentTime.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "Asia/Jakarta",
          })}
        </p>
        <div className="h-px w-10 bg-gradient-to-l from-transparent to-slate-300" />
      </div>
    </>
  );
}
