export default function GoalProgressBar({ percent, color = '#059669', size = 'md' }) {
  const filled = Math.min(100, Math.max(0, percent))
  const blocks = 14
  const filledBlocks = Math.round((filled / 100) * blocks)

  const heights = { sm: 'h-2', md: 'h-2.5', lg: 'h-3' }

  return (
    <div className="space-y-1">
      <div className={`flex gap-0.5 ${heights[size]}`}>
        {Array.from({ length: blocks }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-500"
            style={{
              backgroundColor: i < filledBlocks ? color : '#e2e8f0',
              opacity: i < filledBlocks ? 1 : 0.6,
            }}
          />
        ))}
      </div>
      <p className="text-right text-xs font-semibold text-slate-600">%{filled.toFixed(0)}</p>
    </div>
  )
}
