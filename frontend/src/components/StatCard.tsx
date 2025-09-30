interface Props {
  label: string;
  value: string;
}

function StatCard({ label, value }: Props) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg text-center">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default StatCard;