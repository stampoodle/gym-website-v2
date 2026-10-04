type LineChartProps = {
  values: number[]
  labels: string[]
  height?: number
  formatValue?: (v: number) => string
}

// A small, self-contained line chart. No charting library required —
// keeps the project's dependencies minimal while npm install can't be
// tested ahead of time in this environment.
export default function LineChart({
  values,
  labels,
  height = 160,
  formatValue = (v) => `${Math.round(v)}`,
}: LineChartProps) {
  if (values.length === 0) {
    return <p className="chart-empty">Not enough data yet.</p>
  }

  const width = 560
  const padX = 28
  const padY = 22
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = values.map((v, i) => {
    const x =
      values.length === 1
        ? width / 2
        : padX + (i / (values.length - 1)) * (width - padX * 2)
    const y = height - padY - ((v - min) / range) * (height - padY * 2)
    return { x, y, v }
  })

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')

  const areaPath = `${path} L ${points[points.length - 1].x.toFixed(1)} ${(
    height - padY
  ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(height - padY).toFixed(1)} Z`

  const last = points[points.length - 1]

  return (
    <svg
      className="linechart"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Chart showing values from ${formatValue(values[0])} to ${formatValue(
        values[values.length - 1],
      )}`}
    >
      <path d={areaPath} className="linechart__area" />
      <path d={path} className="linechart__line" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === points.length - 1 ? 4 : 2.5}
          className="linechart__dot"
        />
      ))}
      <text x={last.x} y={last.y - 12} className="linechart__value" textAnchor="end">
        {formatValue(last.v)}
      </text>
      <text x={points[0].x} y={height - 4} className="linechart__label" textAnchor="start">
        {labels[0]}
      </text>
      <text
        x={last.x}
        y={height - 4}
        className="linechart__label"
        textAnchor="end"
      >
        {labels[labels.length - 1]}
      </text>
    </svg>
  )
}
