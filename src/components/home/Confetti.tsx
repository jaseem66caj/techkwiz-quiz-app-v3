import './home-motion.css'

// Confetti lives in its own in-flow strip ABOVE the heading, so it can never overlap text or buttons.

const pieces = [
  { left: '4%', top: '0px', color: '#f97316', delay: '0.0s', duration: '1.8s', size: '8px' },
  { left: '10%', top: '7px', color: '#60a5fa', delay: '0.2s', duration: '2.1s', size: '10px' },
  { left: '16%', top: '14px', color: '#4ade80', delay: '0.5s', duration: '2.4s', size: '12px' },
  { left: '22%', top: '21px', color: '#c084fc', delay: '0.7s', duration: '2.7s', size: '8px' },
  { left: '28%', top: '4px', color: '#fb923c', delay: '0.9s', duration: '1.8s', size: '10px' },
  { left: '34%', top: '11px', color: '#e5e7eb', delay: '1.2s', duration: '2.1s', size: '12px' },
  { left: '40%', top: '18px', color: '#f97316', delay: '1.4s', duration: '2.4s', size: '8px' },
  { left: '46%', top: '1px', color: '#60a5fa', delay: '0.0s', duration: '2.7s', size: '10px' },
  { left: '52%', top: '8px', color: '#4ade80', delay: '0.2s', duration: '1.8s', size: '12px' },
  { left: '58%', top: '15px', color: '#c084fc', delay: '0.5s', duration: '2.1s', size: '8px' },
  { left: '64%', top: '22px', color: '#fb923c', delay: '0.7s', duration: '2.4s', size: '10px' },
  { left: '70%', top: '5px', color: '#e5e7eb', delay: '0.9s', duration: '2.7s', size: '12px' },
  { left: '76%', top: '12px', color: '#f97316', delay: '1.2s', duration: '1.8s', size: '8px' },
  { left: '82%', top: '19px', color: '#60a5fa', delay: '1.4s', duration: '2.1s', size: '10px' },
  { left: '88%', top: '2px', color: '#4ade80', delay: '0.0s', duration: '2.4s', size: '12px' },
  { left: '94%', top: '9px', color: '#c084fc', delay: '0.2s', duration: '2.7s', size: '8px' },
]

export function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative h-20 w-full overflow-hidden">
      {pieces.map((piece, i) => (
        <span
          key={i}
          className="tk-confetti absolute block rounded-sm"
          style={{
            left: piece.left,
            top: piece.top,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
          }}
        />
      ))}
    </div>
  )
}
