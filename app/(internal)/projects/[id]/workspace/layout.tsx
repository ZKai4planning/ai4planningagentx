import type { ReactNode } from "react"

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <section data-workspace-layout="project-workspace" className="w-full">
      {children}
    </section>
  )
}


