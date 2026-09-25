import { ObjectEditor } from "@/components/objects/ObjectEditor";

type Props = { params: Promise<{ id: string }> };

export default async function ObjectDetailPage({ params }: Props) {
  const { id } = await params;
  return <ObjectEditor mode="edit" id={Number(id)} />;
}
