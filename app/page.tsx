import { LayoutDashboardIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function Home() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LayoutDashboardIcon />
        </EmptyMedia>
        <EmptyTitle>Welcome to Car Faults</EmptyTitle>
        <EmptyDescription>
          Look up known chronic issues by make, model, year and engine.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
