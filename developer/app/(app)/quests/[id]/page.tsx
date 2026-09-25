import { Suspense } from "react";
import { QuestEditor } from "@/components/quests/QuestEditor";

export default async function EditQuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<p className="muted">Cargando…</p>}>
      <QuestEditor mode="edit" questId={Number(id)} />
    </Suspense>
  );
}
