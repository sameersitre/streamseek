type Params = Promise<{ mediatype: string; id: string }>;

export default async function MediaDetails({ params }: { params: Params }) {
  const { mediatype, id } = await params;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-bold text-white">Media Details</h1>
      <p className="mt-2 text-zinc-400">
        Type: <span className="text-white">{mediatype}</span> | ID:{" "}
        <span className="text-white">{id}</span>
      </p>
    </div>
  );
}
