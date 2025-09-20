import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Award, CheckCircle, AlertTriangle, Camera, TreePine, Bird, Loader2 } from "lucide-react";
import Link from "next/link";

interface NestBox {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
}

interface ActivityLog {
  id: string;
  nest_box_id: string;
  volunteer_id: string;
  observation_date: string;
  species_observed?: string;
  nest_stage?: string;
  maintenance_needed: boolean;
  maintenance_notes?: string;
  created_at: string;
}

interface VolunteerAssignment {
  id: string;
  nest_box_id: string;
  volunteer_id: string;
  status: string;
  notes?: string;
  assigned_date: string;
  created_at: string;
  nest_boxes?: NestBox;
}

interface UserStats {
  observationsLogged: number;
  nestBoxesMonitored: NestBox[];
  maintenanceTasks: VolunteerAssignment[];
}

interface VolunteerDashboardProps {
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    [key: string]: any; // For any additional user properties
  };
}

export function VolunteerDashboard({ user }: VolunteerDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    observationsLogged: 0,
    nestBoxesMonitored: [] as NestBox[],
    maintenanceTasks: [] as VolunteerAssignment[],
  });
  const [acceptedTasks, setAcceptedTasks] = useState<string[]>([]);
  const [availableMaintenanceTasks, setAvailableMaintenanceTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMockUserStats = async () => {
      try {
        setLoading(true);

        // Mock data
        const mockNestBoxes: NestBox[] = [
          {
            id: "box-1",
            name: "Meadow Box A",
            description: "Located near the meadow entrance",
            latitude: 42.1234,
            longitude: -71.5678,
            status: "active",
            created_at: "2024-01-15T10:00:00Z",
          },
          {
            id: "box-2",
            name: "Trail Box B",
            description: "Along the main hiking trail",
            latitude: 42.1245,
            longitude: -71.5689,
            status: "active",
            created_at: "2024-01-20T10:00:00Z",
          },
        ];

        const mockMaintenanceTasks = [
          {
            id: "task-1",
            nest_box_id: "box-1",
            volunteer_id: user.id,
            status: "assigned",
            notes: "Needs cleaning and minor repairs",
            assigned_date: "2024-12-01",
            created_at: "2024-12-01T10:00:00Z",
            nest_boxes: mockNestBoxes[0],
          },
        ];

        setStats({
          observationsLogged: 12,
          nestBoxesMonitored: mockNestBoxes,
          maintenanceTasks: mockMaintenanceTasks,
        });

        // Mock available maintenance tasks
        setAvailableMaintenanceTasks([
          {
            id: "available-1",
            nest_box_id: "box-3",
            maintenance_notes: "Door hinge needs adjustment",
            created_at: "2024-12-05T10:00:00Z",
            nest_boxes: {
              id: "box-3",
              name: "Forest Box C",
              latitude: 42.1256,
              longitude: -71.57,
            },
            profiles: {
              full_name: "Jane Volunteer",
            },
          },
        ]);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMockUserStats();
  }, [user]);

  const handleAcceptTask = async (taskLog: any) => {
    if (!user) return;

    try {
      // Mock accepting task
      alert("Task accepted! (This is a demo)");
      // Remove from available tasks
      setAvailableMaintenanceTasks((prev) => prev.filter((task) => task.id !== taskLog.id));
    } catch (error) {
      console.error("Error accepting task:", error);
      alert("Error accepting task. Please try again.");
    }
  };

  const handleCompleteTask = async (assignmentId: string) => {
    try {
      // Mock completing task
      alert("Task completed! (This is a demo)");
      // Remove from active tasks
      setStats((prev) => ({
        ...prev,
        maintenanceTasks: prev.maintenanceTasks.filter((task) => task.id !== assignmentId),
      }));
    } catch (error) {
      console.error("Error completing task:", error);
      alert("Error completing task. Please try again.");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-emerald-700">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Bird className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Not signed in</h3>
          <p className="mt-1 text-sm text-gray-500">Please sign in to view your volunteer dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-emerald-900">
          Welcome back, {user?.full_name || 'Volunteer'}!
        </h1>
        <Link href="/volunteer/add-nest-box">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <TreePine className="h-4 w-4 mr-2" />
            Add Nest Box
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bird className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-emerald-900 mb-2">{stats.observationsLogged}</div>
            <div className="text-emerald-700 font-medium">Observations Logged</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TreePine className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-sky-900 mb-2">{stats.nestBoxesMonitored.length}</div>
            <div className="text-sky-700 font-medium">Boxes Monitored</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-yellow-900 mb-2">{stats.maintenanceTasks.length}</div>
            <div className="text-yellow-700 font-medium">Active Tasks</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-200">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100">
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <TreePine className="h-5 w-5" />
            My Monitored Nest Boxes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {stats.nestBoxesMonitored.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {stats.nestBoxesMonitored.map((box) => (
                <div
                  key={box.id}
                  className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200"
                >
                  <div>
                    <div className="font-semibold text-emerald-900">{box.name}</div>
                    <div className="text-sm text-emerald-600">
                      Lat: {box.latitude}, Lng: {box.longitude}
                    </div>
                  </div>
                  <Link href={`/box/${box.id}`}>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-emerald-600 text-center py-4">
              You haven't monitored any nest boxes yet. Start by logging your first observation!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Current Maintenance Tasks */}
      {stats.maintenanceTasks.length > 0 && (
        <Card className="border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="h-5 w-5" />
              My Active Maintenance Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {stats.maintenanceTasks.map((assignment) => (
                <div key={assignment.id} className="border border-green-200 rounded-lg p-5 bg-green-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900">{assignment.nest_boxes?.name || "Nest Box"}</h4>
                      <div className="flex items-center gap-1 text-sm text-green-700 mb-2">
                        <MapPin className="w-4 h-4" />
                        Lat: {assignment.nest_boxes?.latitude}, Lng: {assignment.nest_boxes?.longitude}
                      </div>
                      <p className="text-green-800 mb-2">{assignment.notes}</p>
                      <p className="text-xs text-green-600">
                        Assigned on {new Date(assignment.assigned_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => handleCompleteTask(assignment.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                    <Link href={`/nest-check?box=${assignment.nest_box_id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Log Check
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Maintenance Tasks */}
      <Card className="border-yellow-200">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100">
          <CardTitle className="flex items-center gap-2 text-yellow-900">
            <AlertTriangle className="h-5 w-5" />
            Maintenance Tasks Available
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-yellow-700 mb-6">
            Help keep our nest boxes in excellent condition by accepting and completing maintenance tasks.
          </p>

          {availableMaintenanceTasks.length > 0 ? (
            <div className="space-y-4">
              {availableMaintenanceTasks.map((taskLog) => (
                <div key={taskLog.id} className="border border-yellow-200 rounded-lg p-5 bg-yellow-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-yellow-900">{taskLog.nest_boxes?.name || "Nest Box"}</h4>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-yellow-700 mb-2">
                        <MapPin className="w-4 h-4" />
                        Lat: {taskLog.nest_boxes?.latitude}, Lng: {taskLog.nest_boxes?.longitude}
                      </div>
                      <p className="text-yellow-800 mb-2">{taskLog.maintenance_notes || "Maintenance needed"}</p>
                      <p className="text-xs text-yellow-600">
                        Reported by {taskLog.profiles?.full_name || "Volunteer"} on{" "}
                        {new Date(taskLog.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptTask(taskLog)}
                      className="bg-yellow-600 hover:bg-yellow-700"
                      disabled={acceptedTasks.includes(taskLog.id)}
                    >
                      {acceptedTasks.includes(taskLog.id) ? "Accepted" : "Accept Task"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-yellow-600 text-center py-4">
              No maintenance tasks available at the moment. Thank you for keeping our nest boxes in great condition!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
