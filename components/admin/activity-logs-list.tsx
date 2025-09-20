import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { User, Clock, Search, AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react"

type ActivityLog = {
  id: string
  type: 'inspection' | 'maintenance' | 'alert' | 'system'
  description: string
  user: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
  nestBoxId?: string
  nestBoxName?: string
}

type ActivityLogsListProps = {
  logs: ActivityLog[]
  onViewDetails: (id: string) => void
}

export function ActivityLogsList({ logs, onViewDetails }: ActivityLogsListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'inspection':
        return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Inspection</Badge>
      case 'maintenance':
        return <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">Maintenance</Badge>
      case 'alert':
        return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">Alert</Badge>
      default:
        return <Badge variant="outline">System</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Activity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <span className="line-clamp-1">{log.description}</span>
                    {log.nestBoxName && (
                      <Badge variant="outline" className="ml-2">
                        {log.nestBoxName}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(log.type)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{log.user}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(log.timestamp)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(log.id)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No activity logs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
