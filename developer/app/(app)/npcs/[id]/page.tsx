import { NpcEditor } from "@/components/npcs/NpcEditor";

type Props = { params: Promise<{ id: string }> };

export default async function NpcDetailPage({ params }: Props) {
  const { id } = await params;
  return <NpcEditor mode="edit" id={Number(id)} />;
}
