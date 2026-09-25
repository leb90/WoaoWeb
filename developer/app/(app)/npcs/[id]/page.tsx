import { NpcEditor } from "@/components/npcs/NpcEditor";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fromQuest?: string }>;
};

export default async function NpcDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const fromQuest = sp.fromQuest ? Number(sp.fromQuest) : undefined;
  return (
    <NpcEditor
      mode="edit"
      id={Number(id)}
      fromQuest={Number.isFinite(fromQuest) ? fromQuest : undefined}
    />
  );
}
