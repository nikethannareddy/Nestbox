import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, MapPin, MoreHorizontal, Trash } from "lucide-react"

type NestBox = {
  id: string
  name: string
  description?: string
  latitude: number
  longitude: number
  status: 'active' | 'inactive' | 'maintenance_needed' | 'removed'
  installation_date?: string
  updated_at: string
  volunteerCount?: number
  last_checked?: string
}

type NestBoxesListProps = {
  nestBoxes: NestBox[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function NestBoxesList({ nestBoxes = [], onEdit, onDelete }: NestBoxesListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      case 'maintenance_needed':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Maintenance Needed</Badge>
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>
      case 'removed':
        return <Badge variant="destructive">Removed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
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
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Volunteers</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nestBoxes && nestBoxes.length > 0 ? (
            nestBoxes.map((nestBox) => (
              <TableRow key={nestBox.id}>
                <TableCell className="font-medium">{nestBox.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{nestBox.latitude?.toFixed(6)}, {nestBox.longitude?.toFixed(6)}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(nestBox.status)}</TableCell>
                <TableCell>{formatDate(nestBox.updated_at)}</TableCell>
                <TableCell>{nestBox.volunteerCount || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(nestBox.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(nestBox.id)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No nest boxes found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
