// import { supabase } from '../supabase.provider';

// export const GYM_OWNERS_BUCKET = 'gym-owners';

// /** Build a public CDN URL for an object path stored in gym-owners */
// export function publicUrlForGymOwner(path: string): string {
//   return supabase
//     .storage
//     .from(GYM_OWNERS_BUCKET)
//     .getPublicUrl(path)
//     .data.publicUrl;
// }