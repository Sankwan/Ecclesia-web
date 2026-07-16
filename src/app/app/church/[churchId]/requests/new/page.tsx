import { serverApiFetch } from "@/lib/api-server";
import { NewRequestForm } from "@/components/forms/new-request-form";
import type { Skill } from "@/lib/types";

export default async function NewRequestPage({
  params,
}: {
  params: Promise<{ churchId: string }>;
}) {
  const { churchId } = await params;
  const skills = await serverApiFetch<Skill[]>("/skills");
  return <NewRequestForm churchId={churchId} skills={skills} />;
}
