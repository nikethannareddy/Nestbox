import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Activity, Box, Users, AlertCircle } from "lucide-react"
import type { NestBox, Profile, ActivityLog, VolunteerAssignment } from "@/lib/types/database"

type StatsCardProps = {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
}

const StatsCard = ({ title, value, icon, description }: StatsCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
)

type DashboardOverviewProps = {
  nestBoxes: any[]
  volunteers: any[]
  activityLogs: any[]
  assignments: any[]
}

export function DashboardOverview({ nestBoxes = [], volunteers = [], activityLogs = [], assignments = [] }: DashboardOverviewProps) {
  // Calculate statistics
  const totalNestBoxes = nestBoxes.length
  const activeNestBoxes = nestBoxes.filter(box => box.status === 'active').length
  const totalVolunteers = volunteers.length
  const pendingTasks = assignments.filter(task => 
    task.status === 'assigned' || task.status === 'in_progress'
  ).length

  const activeNestBoxPercentage = totalNestBoxes > 0 
    ? Math.round((activeNestBoxes / totalNestBoxes) * 100) 
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Nest Boxes"
        value={totalNestBoxes}
        icon={<Box className="h-4 w-4" />}
      />
      <StatsCard
        title="Active Nest Boxes"
        value={activeNestBoxes}
        icon={<Box className="h-4 w-4 text-green-500" />}
        description={`${activeNestBoxPercentage}% of total`}
      />
      <StatsCard
        title="Total Volunteers"
        value={totalVolunteers}
        icon={<Users className="h-4 w-4" />}
      />
      <StatsCard
        title="Pending Tasks"
        value={pendingTasks}
        icon={pendingTasks > 0 ? 
          <AlertCircle className="h-4 w-4 text-yellow-500" /> : 
          <Activity className="h-4 w-4 text-green-500" />
        }
        description={pendingTasks > 0 ? "Needs attention" : "All caught up!"}
      />
    </div>
  )
}
