import { AppChat } from "@/components/app-chat";

export default async function SessionPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return <AppChat id={id} />;
}
