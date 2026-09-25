import { MapEditor } from "@/components/maps/MapEditor";

type Props = { params: Promise<{ id: string }> };

export default async function MapEditorPage({ params }: Props) {
  const { id } = await params;
  return <MapEditor mapId={Number(id)} />;
}
