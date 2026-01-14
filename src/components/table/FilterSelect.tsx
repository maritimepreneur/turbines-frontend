"use client"

type Option = {
  label: string
  value: string
}

type Props = {
  value: string
  onChange: (value: string) => void
  options: Option[]
}

export default function FilterSelect({
  value,
  onChange,
  options,
}: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border rounded-lg text-sm"
    >
      <option value="">All</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
