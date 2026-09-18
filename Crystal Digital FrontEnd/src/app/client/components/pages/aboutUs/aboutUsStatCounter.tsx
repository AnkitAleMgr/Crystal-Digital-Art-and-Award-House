import { useCounter } from "../../../hooks/useCounter";
import { useInView } from "../../../hooks/useInView";

export function StatCounter({
  target,
  label,
  suffix = "+",
}: {
  target: number;
  label: string;
  suffix?: string;
}) {
  const { ref, visible } = useInView(0.3);
  const count = useCounter(target, visible);
  return (
    <div ref={ref} className="text-center">
      <div
        className="stat-number text-4xl font-bold mb-1"
        style={{
          color: "#D4AF37",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {count}
        {suffix}
      </div>
      <div className="text-sm text-blue-100 font-medium">
        {label}
      </div>
    </div>
  );
}