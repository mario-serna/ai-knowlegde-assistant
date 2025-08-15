import { AppChat } from "@/components/app-chat";

type params = Promise<{ id: string }>;

interface Props {
  params: params;
}

export default async function SessionPage({ params }: Props) {
  const { id } = await params;

  return <AppChat id={id} />;
}
