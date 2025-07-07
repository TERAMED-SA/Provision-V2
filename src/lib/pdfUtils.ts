// Extrai colunas do array de colunas da tabela para o formato do GenericPDF
export function extractColumnsForPDF(columns: any[]): { key: string; label: string }[] {
  return columns
    .filter(col => !!col.accessorKey)
    .map(col => ({
      key: col.accessorKey,
      label: typeof col.header === 'string'
        ? col.header
        : (typeof col.header === 'function'
            ? (col.header({ column: { getIsSorted: () => false, toggleSorting: () => {} } })?.props?.children || col.accessorKey)
            : col.accessorKey),
    }));
}

// Extrai sections automaticamente de campos que são arrays de objetos
export function extractSectionsFromData(data: Record<string, any>): any[] {
  return Object.entries(data)
    .filter(([_, value]) => Array.isArray(value) && value.length > 0 && typeof value[0] === 'object')
    .map(([key, value]) => ({
      title: key.charAt(0).toUpperCase() + key.slice(1),
      items: value,
      itemFields: Object.keys(value[0]).map(fieldKey => ({
        key: fieldKey,
        label: fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1),
      })),
    }));
}

// Extrai sections com tradução customizada para títulos e labels
export function extractSectionsWithTranslations(data: Record<string, any>, translations: Record<string, { title: string, fields: Record<string, string> }>): any[] {
  return Object.entries(data)
    .filter(([_, value]) => Array.isArray(value) && value.length > 0 && typeof value[0] === 'object')
    .map(([key, value]) => {
      const sectionTranslation = translations[key];
      return {
        title: sectionTranslation?.title || (key.charAt(0).toUpperCase() + key.slice(1)),
        items: value,
        itemFields: Object.keys(value[0]).map(fieldKey => ({
          key: fieldKey,
          label: sectionTranslation?.fields?.[fieldKey] || (fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)),
        })),
      };
    });
} 