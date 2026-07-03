interface StatsCardProps {
  label: string
  value: number | string
  icon: string
  color?: string
}

export default function StatsCard({ label, value, icon, color = 'vault' }: StatsCardProps) {
  const colors: Record<string, string> = {
    vault: 'border-vault-500/20 bg-vault-500/5 text-vault-300',
    green: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300',
    orange: 'border-orange-500/20 bg-orange-500/5 text-orange-300',
    blue: 'border-blue-500/20 bg-blue-500/5 text-blue-300',
    purple: 'border-purple-500/20 bg-purple-500/5 text-purple-300',
    red: 'border-red-500/20 bg-red-500/5 text-red-300',
  }

  const c = colors[color] || colors.vault

  return (
    <div className={`rounded-xl border ${c} p-4`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
      </div>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider">{label}</p>
    </div>
  )
}
