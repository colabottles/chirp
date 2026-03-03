// Typed Supabase client — use this instead of bare useSupabaseClient()
// so all .from() queries get full Database type inference.
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

export function useDatabase(): SupabaseClient<Database> {
  return useSupabaseClient() as SupabaseClient<Database>
}