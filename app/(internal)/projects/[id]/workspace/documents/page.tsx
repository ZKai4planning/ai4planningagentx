import { redirect } from "next/navigation"

export default async function WorkspaceDocumentsRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/projects/${id}/workspace/agent-y-documents`)
}
