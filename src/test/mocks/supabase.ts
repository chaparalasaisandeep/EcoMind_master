import { vi } from 'vitest';

type MockQueryChain = {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  neq: ReturnType<typeof vi.fn>;
  gt: ReturnType<typeof vi.fn>;
  gte: ReturnType<typeof vi.fn>;
  lt: ReturnType<typeof vi.fn>;
  lte: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  rpc: ReturnType<typeof vi.fn>;
};

function createMockQueryChain(resolvedData: unknown = null, resolvedError: unknown = null): MockQueryChain {
  const chain: Partial<MockQueryChain> = {};

  const resolveWith = () => Promise.resolve({ data: resolvedData, error: resolvedError });

  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.delete = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.neq = vi.fn().mockReturnValue(chain);
  chain.gt = vi.fn().mockReturnValue(chain);
  chain.gte = vi.fn().mockReturnValue(chain);
  chain.lt = vi.fn().mockReturnValue(chain);
  chain.lte = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.maybeSingle = vi.fn().mockResolvedValue({ data: resolvedData, error: resolvedError });
  chain.single = vi.fn().mockResolvedValue({ data: resolvedData, error: resolvedError });

  return chain as MockQueryChain;
}

export function createMockSupabaseClient(data: unknown = null, error: unknown = null) {
  const chain = createMockQueryChain(data, error);

  // Allow overriding resolved values
  const setResolvedData = (newData: unknown, newError: unknown = null) => {
    chain.maybeSingle = vi.fn().mockResolvedValue({ data: newData, error: newError });
    chain.single = vi.fn().mockResolvedValue({ data: newData, error: newError });
  };

  const from = vi.fn().mockReturnValue(chain);
  const rpc = vi.fn().mockResolvedValue({ data, error });

  const auth = {
    getSession: vi.fn().mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' }, access_token: 'test-token' } },
    }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signUp: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  };

  return {
    from,
    rpc,
    auth,
    chain,
    setResolvedData,
  };
}

export const mockSupabase = createMockSupabaseClient();

export function resetMockSupabase() {
  Object.assign(mockSupabase, createMockSupabaseClient());
}
