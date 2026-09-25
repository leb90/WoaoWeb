import { ObjectEditor } from "@/components/objects/ObjectsBrowser";

type Props = { params: Promise<{ id: string }> };

export default async function ObjectDetailPage({ params }: Props) {
  const { id } = await params;
  return <ObjectEditor id={Number(id)} />;
}
