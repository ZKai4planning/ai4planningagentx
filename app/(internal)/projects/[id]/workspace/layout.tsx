import WorkspaceHeader from "@/components/WorkspaceHeader"

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {

  const { id } = await params

  return (
    <section data-workspace-layout="project-workspace" className="w-full">
      <WorkspaceHeader projectId={id} />
      {children}
    </section>
  )
}

