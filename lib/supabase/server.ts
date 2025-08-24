import { createClient as createCustomClient } from "./client"

export async function createClient() {
  return createCustomClient()
}
