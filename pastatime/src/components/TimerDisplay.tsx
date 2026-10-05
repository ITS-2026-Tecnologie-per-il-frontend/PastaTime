interface TimerDisplayProps {
  remainingMs: number;
  isRinging: boolean;
}

const pad = (n: number): string => String(n).padStart(2, "0");

function format(ms: number): string {
  const overtime = ms < 0;
  const totalSec = Math.floor(Math.abs(ms) / 1000);
  const text = `${pad(Math.floor(totalSec / 60))}:${pad(totalSec % 60)}`;
  return overtime ? `+${text}` : text;
}

export default function TimerDisplay({ remainingMs, isRinging }: TimerDisplayProps) {
  return (
    <div className={`timer-display ${isRinging ? "ringing" : ""}`} role="timer" aria-live="off">
      {format(remainingMs)}
    </div>
  );
}