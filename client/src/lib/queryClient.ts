import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase-client";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorData = null;
    let errorMessage = res.statusText;
    
    // Try to get the response text first
    try {
      const responseText = await res.text();
      console.log('Error response text:', responseText);
      
      // Try to parse as JSON
      if (responseText) {
        try {
          errorData = JSON.parse(responseText);
          errorMessage = errorData.message || res.statusText;
          console.log('Parsed error data:', errorData);
        } catch (jsonError) {
          console.log('Failed to parse JSON, using text as message:', responseText);
          errorMessage = responseText;
        }
      }
    } catch (textError) {
      console.error('Failed to read response text:', textError);
      errorMessage = res.statusText;
    }
    
    // Create a custom error with structured data
    const error = new Error(errorMessage);
    (error as any).status = res.status;
    (error as any).data = errorData;
    
    console.log('Throwing error with data:', { status: res.status, data: errorData, message: errorMessage });
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Auth optional for public endpoints
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Query error for ${queryKey[0]}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
    },
  },
});
