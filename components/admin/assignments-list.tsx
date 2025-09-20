import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { User, Box, Calendar, MoreHorizontal, CheckCircle, XCircle } from "lucide-react"

type Assignment = {
  id: string
  volunteer: {
    id: string
    name: string
    email: string
  }
  nestBox: {
    id: string
    name: string
    location: string
  }
  status: 'active' | 'completed' | 'pending' | 'overdue'
  assignedDate: string
  dueDate: string
  lastUpdated: string
}

type AssignmentsListProps = {
  assignments: Assignment[]
  onEdit: (id: string) => void
  onUpdateStatus: (id: string, status: 'active' | 'completed' | 'pending' | 'overdue') => void
}

export function AssignmentsList({ assignments, onEdit, onUpdateStatus }: AssignmentsListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
      case 'overdue':
        return <Badge className="bg-red-500 hover:bg-red-600">Overdue</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Volunteer</TableHead>
            <TableHead>Nest Box</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.length > 0 ? (
            assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{assignment.volunteer.name}</div>
                      <div className="text-sm text-muted-foreground">{assignment.volunteer.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-muted-foreground" />
                    <span>{assignment.nestBox.name}</span>
                  </div>
                </TableCell>
                <TableCell>{assignment.nestBox.location}</TableCell>
                <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(assignment.assignedDate)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(assignment.dueDate)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {assignment.status !== 'completed' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-500 hover:bg-green-100"
                        onClick={() => onUpdateStatus(assignment.id, 'completed')}
                        title="Mark as completed"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="sr-only">Complete</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(assignment.id)}
                      title="Edit assignment"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No assignments found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
