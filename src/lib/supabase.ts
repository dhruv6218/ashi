// Dummy Supabase Client for Frontend-Only Prototype
// This prevents import errors without needing a real backend connection.

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getUser: async () => ({ data: { user: null } }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({ 
      eq: () => ({ 
        order: () => ({ data: [], error: null }), 
        single: () => ({ data: null, error: null }) 
      }),
      order: () => ({ data: [], error: null }),
      single: () => ({ data: null, error: null })
    }),
    insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
    update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
    delete: () => ({ eq: () => ({ data: null, error: null }), match: () => ({ error: null }) }),
    upsert: () => ({ data: null, error: null }),
  }),
  rpc: async () => ({ data: null, error: null }),
  functions: {
    invoke: async () => ({ data: null, error: null })
  },
  storage: {
    from: () => ({ upload: async () => ({ data: null, error: null }) })
  },
  channel: () => ({ on: () => ({ subscribe: () => {} }) }),
  removeChannel: () => {}
};
