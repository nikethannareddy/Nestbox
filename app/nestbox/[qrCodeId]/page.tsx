import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function NestBoxDetailsPage({
  params,
}: {
  params: { qrCodeId: string };
}) {
  const supabase = createClient();
  
  // Get nest box details by QR code ID
  const { data: nestBox, error } = await supabase
    .rpc('get_nest_box_by_qr_code', { qr_id: params.qrCodeId })
    .single();

  if (error || !nestBox) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{nestBox.name}</h1>
            <p className="text-muted-foreground">Nest Box ID: {nestBox.id}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <Icons.home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Nest Box Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge variant={nestBox.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                    {nestBox.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                  <p className="mt-1">{nestBox.location || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Maintenance</h3>
                  <p className="mt-1">
                    {nestBox.last_maintenance 
                      ? new Date(nestBox.last_maintenance).toLocaleDateString() 
                      : 'No maintenance recorded'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Next Maintenance</h3>
                  <p className="mt-1">
                    {nestBox.next_maintenance 
                      ? new Date(nestBox.next_maintenance).toLocaleDateString()
                      : 'Not scheduled'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report an Issue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Found an issue with this nest box? Let us know!
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/report-issue?nestBoxId=${nestBox.id}`}>
                    <Icons.alertCircle className="mr-2 h-4 w-4" />
                    Report Issue
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/maintenance?nestBoxId=${nestBox.id}`}>
                    <Icons.tool className="mr-2 h-4 w-4" />
                    Log Maintenance
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Activity Log</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/nestbox/${nestBox.id}/activity`}>
                    View All
                    <Icons.chevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nestBox.recent_activity?.length > 0 ? (
                  nestBox.recent_activity.map((activity: any) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {activity.type === 'maintenance' ? (
                          <Icons.tool className="h-5 w-5 text-blue-500" />
                        ) : activity.type === 'observation' ? (
                          <Icons.binoculars className="h-5 w-5 text-green-500" />
                        ) : (
                          <Icons.alertCircle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm mt-1">{activity.notes}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No recent activity recorded for this nest box.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { qrCodeId: string };
}) {
  const supabase = createClient();
  
  const { data: nestBox } = await supabase
    .rpc('get_nest_box_by_qr_code', { qr_id: params.qrCodeId })
    .single();

  if (!nestBox) {
    return {
      title: 'Nest Box Not Found',
    };
  }

  return {
    title: `${nestBox.name} | Nest Box Details`,
    description: `View details about nest box ${nestBox.name} located at ${nestBox.location || 'an undisclosed location'}.`,
  };
}
