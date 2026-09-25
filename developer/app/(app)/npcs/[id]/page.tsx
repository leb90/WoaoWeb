import { NpcEditor } from "@/components/npcs/NpcsBrowser";

type Props = { params: Promise<{ id: string }> };

export default async function NpcDetailPage({ params }: Props) {
  const { id } = await params;
  return <NpcEditor id={Number(id)} />;
}
