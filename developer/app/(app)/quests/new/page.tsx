import { Suspense } from "react";
import { QuestEditor } from "@/components/quests/QuestEditor";

export default function NewQuestPage() {
  return (
    <Suspense fallback={<p className="muted">Cargando…</p>}>
      <QuestEditor mode="create" />
    </Suspense>
  );
}
