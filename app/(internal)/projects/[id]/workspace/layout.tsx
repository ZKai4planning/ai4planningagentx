// import type { ReactNode } from "react"
// import WorkspaceHeader from "@/components/WorkspaceHeader"

// export default function WorkspaceLayout({
//   children,
//   params,
// }: {
//   children: ReactNode
//   params: { id: string }
// }) {
//   const { id } = params
//   return (
//     <section data-workspace-layout="project-workspace" className="w-full">
//       <WorkspaceHeader projectId={id} />
//       {children}
//     </section>
//   )
// }


export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {

  const { id } = await params

  return (
    <div>
      {children}
    </div>
  )
}

