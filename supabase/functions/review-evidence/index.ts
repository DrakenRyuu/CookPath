import catalog from './catalog.json' with { type: 'json' };
import { createHandler } from './handler.mjs';

// Every POST validates the user's JWT with Supabase Auth before reading progress or media.
Deno.serve(createHandler({env:(name:string)=>Deno.env.get(name),catalog}));
