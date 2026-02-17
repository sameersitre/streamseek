import DetailsClient from "./DetailsClient";

type Params = Promise<{ mediatype: string; id: string }>;

export default async function MediaDetails({ params }: { params: Params }) {
  const { mediatype, id } = await params;

  return <DetailsClient mediatype={mediatype} id={id} />;
}
