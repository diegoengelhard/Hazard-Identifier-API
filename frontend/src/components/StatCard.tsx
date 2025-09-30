interface Props {
  label: string;
  value: string;
  extra?: string;
  subtle?: boolean;
  tone?: 'neutral' | 'success' | 'danger';
}

function StatCard({ label, value, extra, subtle, tone = 'neutral' }: Props) {
  // Tone classes
  const toneMap: Record<string, string> = {
    neutral: 'bg-gray-100 text-gray-800',
    success: 'bg-green-50 text-green-800 ring-1 ring-green-200',
    danger: 'bg-red-50 text-red-700 ring-1 ring-red-200'
  };

  const base = subtle
    ? 'bg-gray-100'
    : toneMap[tone];

  return (
    <div className={`p-4 rounded-lg text-center flex flex-col justify-center ${base}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-xl font-bold leading-tight">{value}</p>
      {extra && (
        <p className="mt-0.5 text-[11px] font-medium opacity-70">
          Score: {extra}
        </p>
      )}
    </div>
  );
}

export default StatCard;