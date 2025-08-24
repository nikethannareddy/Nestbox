// For server-side, we'll use the same mock client
import { createClient as createMockClient } from "./client"

export async function createClient() {
  // In a real implementation, this would handle cookies and server-side auth
  // For now, return the same mock client
  return createMockClient()
}
