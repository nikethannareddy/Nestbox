"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, MapPin, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

const nestBoxSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  latitude: z.string().regex(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/, "Invalid latitude"),
  longitude: z.string().regex(/^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/, "Invalid longitude"),
  status: z.enum(["active", "inactive", "maintenance", "retired"]),
  installation_date: z.string().optional(),
  last_maintenance_date: z.string().optional(),
  notes: z.string().optional(),
})

type NestBoxFormValues = z.infer<typeof nestBoxSchema>

export default function AddNestBoxPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<NestBoxFormValues>({
    resolver: zodResolver(nestBoxSchema),
    defaultValues: {
      status: "active",
    },
  })

  const currentStatus = watch("status")

  const onSubmit = async (data: NestBoxFormValues) => {
    try {
      setIsLoading(true)
      
      console.log("Submitting data:", data);
      
      const { data: result, error } = await supabase
        .from("nest_boxes")
        .insert([
          {
            name: data.name,
            description: data.description,
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            status: data.status,
            installation_date: data.installation_date || null,
            last_maintenance: data.last_maintenance_date || null,
            notes: data.notes,
          },
        ])
        .select()

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      console.log("Insert result:", result)

      toast({
        title: "Success!",
        description: "Nest box has been added successfully.",
      })

      router.push("/admin")
    } catch (error: any) {
      console.error("Caught error:", {
        message: error?.message,
        details: error?.details,
        code: error?.code,
        name: error?.name,
        stack: error?.stack,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      
      toast({
        title: "Error",
        description: "Failed to add nest box. Please check the console for details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("latitude", position.coords.latitude.toString(), { shouldValidate: true })
          setValue("longitude", position.coords.longitude.toString(), { shouldValidate: true })
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Location Error",
            description: "Could not get your current location. Please enter the coordinates manually.",
            variant: "destructive",
          })
        }
      )
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation. Please enter the coordinates manually.",
        variant: "destructive",
      })
    }
  }

  const logTableStructure = async () => {
    try {
      // Use the Supabase SQL editor to run a direct query
      const { data, error } = await supabase.rpc('get_columns_info', {
        table_name: 'nest_boxes'
      });
      
      if (error) {
        console.error('Supabase RPC error:', error);
        
        // Fallback: Try to get one row to see the structure
        const { data: sampleData, error: sampleError } = await supabase
          .from('nest_boxes')
          .select('*')
          .limit(1);
          
        if (sampleError) {
          console.error('Error getting sample data:', sampleError);
        } else {
          console.log('Sample data structure:', sampleData?.[0]);
        }
        
        return;
      }
      
      console.log('Table structure:', data);
    } catch (err) {
      console.error('Error getting table structure:', err);
    }
  };

  const logDatabaseSchema = async () => {
    try {
      // Get all tables in the public schema
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (tablesError) throw tablesError;
      
      console.log('Tables in database:', tables);
      
      // For each table, get its columns
      for (const table of tables || []) {
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type')
          .eq('table_schema', 'public')
          .eq('table_name', table.table_name);
        
        if (columnsError) throw columnsError;
        
        console.log(`Columns in ${table.table_name}:`, columns);
      }
    } catch (err) {
      console.error('Error getting database schema:', err);
    }
  };

  const checkSchema = async () => {
    try {
      // First, check if the table exists
      const { data: tableExists } = await supabase
        .from('information_schema.tables')
        .select('*')
        .eq('table_schema', 'public')
        .eq('table_name', 'nest_boxes')
        .single();
      
      if (!tableExists) {
        console.error('Error: nest_boxes table does not exist in the public schema');
        return;
      }

      // If table exists, get its columns
      const { data: columns, error } = await supabase.rpc('get_columns', {
        table_name: 'nest_boxes'
      });

      if (error) {
        console.error('Error getting columns:', error);
        
        // Fallback: Try a different approach
        const { data } = await supabase
          .from('nest_boxes')
          .select('*')
          .limit(1);
          
        if (data && data[0]) {
          console.log('Sample row structure:', Object.keys(data[0]));
        } else {
          console.log('No data in nest_boxes table');
        }
        return;
      }
      
      console.log('Table columns:', columns);
    } catch (err) {
      console.error('Error checking schema:', err);
    }
  };

  const listAllTables = async () => {
    try {
      const { data: tables, error } = await supabase
        .from('pg_tables')
        .select('tablename, schemaname')
        .order('schemaname')
        .order('tablename');

      if (error) throw error;
      
      console.log('All tables in database:');
      tables?.forEach(table => {
        console.log(`- ${table.schemaname}.${table.tablename}`);
      });
      
      return tables;
    } catch (err) {
      console.error('Error listing tables:', err);
      return [];
    }
  };

  const findNestBoxesTable = async () => {
    try {
      // Check all schemas for the nest_boxes table
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_schema, table_name')
        .or('table_name.eq.nest_boxes,table_name.eq.nest_box,table_name.ilike.%nest%')
        .order('table_schema')
        .order('table_name');

      if (error) throw error;
      
      if (data.length === 0) {
        console.log('No nest boxes table found. Available tables:');
        const { data: allTables } = await supabase
          .from('pg_tables')
          .select('schemaname, tablename')
          .order('schemaname')
          .order('tablename');
        console.log(allTables);
        return;
      }
      
      console.log('Found matching tables:');
      data.forEach(t => {
        console.log(`- ${t.table_schema}.${t.table_name}`);
      });
      
      return data;
    } catch (err) {
      console.error('Error finding nest_boxes table:', err);
      return [];
    }
  };

  useEffect(() => {
    logTableStructure();
    logDatabaseSchema();
    checkSchema();
    listAllTables();
    findNestBoxesTable();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Add New Nest Box</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details below to add a new nest box to the system.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nest Box Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Park Avenue Box #1"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter a brief description of this nest box"
                {...register("description")}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="latitude"
                    placeholder="e.g., 42.3601"
                    {...register("latitude")}
                    className={errors.latitude ? "border-destructive" : ""}
                  />
                </div>
                {errors.latitude && (
                  <p className="text-sm text-destructive mt-1">{errors.latitude.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="longitude">Longitude *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="longitude"
                    placeholder="e.g., -71.0589"
                    {...register("longitude")}
                    className={errors.longitude ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={getCurrentLocation}
                    title="Use current location"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                {errors.longitude && (
                  <p className="text-sm text-destructive mt-1">{errors.longitude.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  onValueChange={(value: NestBoxFormValues["status"]) => setValue("status", value, { shouldValidate: true })}
                  value={currentStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Needs Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="installation_date">Installation Date</Label>
                <Input
                  id="installation_date"
                  type="date"
                  {...register("installation_date")}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="last_maintenance_date">Last Maintenance Date</Label>
              <Input
                id="last_maintenance_date"
                type="date"
                {...register("last_maintenance_date")}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes or observations"
                {...register("notes")}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Nest Box
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
