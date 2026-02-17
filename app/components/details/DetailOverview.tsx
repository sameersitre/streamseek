interface DetailOverviewProps {
  overview: string;
}

export default function DetailOverview({ overview }: DetailOverviewProps) {
  if (!overview) return null;

  return (
    <div className="mt-4">
      <h2 className="mb-2 text-lg font-semibold text-white">Overview</h2>
      <p className="leading-relaxed text-zinc-300">{overview}</p>
    </div>
  );
}
