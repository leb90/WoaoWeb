import { SpellEditor } from "@/components/spells/SpellEditor";

type Props = { params: Promise<{ id: string }> };

export default async function SpellDetailPage({ params }: Props) {
  const { id } = await params;
  return <SpellEditor mode="edit" id={Number(id)} />;
}
