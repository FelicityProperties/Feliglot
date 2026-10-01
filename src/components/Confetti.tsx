// A short burst of confetti. Pure CSS; hidden for people who prefer reduced motion.
const COLORS = ["var(--primary)", "var(--celebration)", "var(--saffron)", "var(--success)"];

export default function Confetti() {
  return (
    <div aria-hidden className="confetti pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 36 }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 9) * 70}ms`,
            animationDuration: `${1400 + ((i * 53) % 900)}ms`,
            transform: `rotate(${(i * 47) % 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}
