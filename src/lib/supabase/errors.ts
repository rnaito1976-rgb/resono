type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

/** True when PostgREST cannot find a table, view, or RPC in the schema cache. */
export function isMissingSchemaObject(
  error: SupabaseErrorLike | null | undefined,
  objectName: string
): boolean {
  if (!error) {
    return false;
  }

  return (
    error.code === "PGRST202" ||
    error.code === "PGRST205" ||
    Boolean(error.message?.includes(objectName))
  );
}

export function logSupabaseError(
  context: string,
  error: SupabaseErrorLike | null | undefined,
  options?: { ignoreMissing?: string[] }
): void {
  if (!error?.message) {
    return;
  }

  if (
    options?.ignoreMissing?.some((objectName) =>
      isMissingSchemaObject(error, objectName)
    )
  ) {
    return;
  }

  console.error(`[Supabase] ${context}:`, error.message);
}
