import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function KpiCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  children,        // the main value (often a <CountUp/>)
  delta,           // { value: string, dir: 'up'|'down'|null, note: string }
  sparkColor,
  sparkPoints,     // array of [x,y] normalized 0..1 or raw svg points string
  index = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-card border border-border bg-card px-[17px] py-4"
    >
      <div
        className="mb-3.5 grid h-[30px] w-[30px] place-items-center rounded-lg"
        style={{ background: iconBg, color: iconColor }}
      >
        <Icon size={15} />
      </div>

      <div className="text-[12px] font-medium text-muted">{label}</div>
      <div className="mt-[3px] text-[25px] font-extrabold">{children}</div>

      {delta && (
        <div
          className={`mt-[7px] flex items-center gap-[5px] text-[11.5px] font-semibold ${
            delta.dir === "up" ? "text-neg" : delta.dir === "down" ? "text-pos" : ""
          }`}
        >
          {delta.dir === "up" && <ArrowUpRight size={12} />}
          {delta.dir === "down" && <ArrowDownRight size={12} />}
          {delta.value && <span>{delta.value}</span>}
          {delta.note && (
            <span className="font-normal text-muted2">{delta.note}</span>
          )}
        </div>
      )}

      {sparkPoints && (
        <svg
          className="absolute right-3.5 top-4 h-[26px] w-[62px]"
          viewBox="0 0 62 26"
          preserveAspectRatio="none"
        >
          <polyline
            points={sparkPoints}
            fill="none"
            stroke={sparkColor}
            strokeWidth="1.6"
          />
        </svg>
      )}
    </motion.div>
  );
}
