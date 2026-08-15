import { useRef, useState } from 'react'

export default function Carousel({ children, className = '' }) {
  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const items = Array.isArray(children) ? children.filter(Boolean) : [children]

  const scrollTo = (index) => {
    const track = trackRef.current
    if (!track) return
    const child = track.children[index]
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      setActiveIndex(index)
    }
  }

  const handleScroll = () => {
    const track = trackRef.current
    if (!track || !track.children.length) return
    const center = track.scrollLeft + track.clientWidth / 2
    let closest = 0
    let minDist = Infinity
    Array.from(track.children).forEach((child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2
      const dist = Math.abs(center - childCenter)
      if (dist < minDist) {
        minDist = dist
        closest = i
      }
    })
    setActiveIndex(closest)
  }

  if (!items.length) return null

  return (
    <div className={className}>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="carousel-track flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide"
      >
        {items.map((item, i) => (
          <div key={i} className="carousel-slide shrink-0 snap-center">
            {item}
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? 'w-6 bg-emerald-500' : 'w-1.5 bg-slate-300'
              }`}
              aria-label={`Slayt ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
