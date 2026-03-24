/**
 * Vendure Shop API custom scalar type mappings
 * Used in codegen configuration and runtime type checking
 */
export const vendureScalars = {
  DateTime: 'string',
  JSON: 'Record<string, any>',
  Money: 'number',
  Upload: 'File',
} as const;
