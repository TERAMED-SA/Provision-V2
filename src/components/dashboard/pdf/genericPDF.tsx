"use client"
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 18,
    fontFamily: "Helvetica",
    backgroundColor: "#fafafa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottom: "1px solid #bcd",
    paddingBottom: 8,
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2d3a4a",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 10,
    textAlign: "center",
    color: "#6b7280",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "#f3f4f6",
    color: "#2d3a4a",
    padding: 7,
    marginBottom: 8,
    marginTop: 12,
    borderLeft: "3px solid #bcd",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  infoItem: {
    width: "48%",
    backgroundColor: "#f7f7f7",
    padding: 6,
    borderRadius: 3,
    borderLeft: "2px solid #bcd",
  },
  infoLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 9,
    color: "#222",
    fontWeight: "normal",
  },
  detailsContainer: {
    backgroundColor: "#f7f7f7",
    padding: 7,
    marginBottom: 8,
    borderRadius: 3,
    border: "1px solid #eee",
  },
  detailsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#2d3a4a",
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 8,
    lineHeight: 1.3,
    color: "#555",
  },
  tableContainer: {
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  tableHeaderText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 8,
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 3,
    paddingHorizontal: 3,
    backgroundColor: "#fff",
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 3,
    paddingHorizontal: 3,
    backgroundColor: "#f7f7f7",
  },
  tableCell: {
    fontSize: 7,
    flex: 1,
    textAlign: "center",
    color: "#333",
  },
  equipmentCard: {
    backgroundColor: "#fff",
    border: "1px solid #eee",
    borderRadius: 3,
    padding: 7,
    marginBottom: 6,
  },
  equipmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  equipmentName: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#2d3a4a",
  },
  equipmentStatus: {
    fontSize: 8,
    padding: 2,
    borderRadius: 2,
    backgroundColor: "#e7fbe7",
    color: "#228b22",
  },
  equipmentDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  equipmentDetailItem: {
    width: "30%",
    marginBottom: 2,
  },
  equipmentDetailLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#6b7280",
  },
  equipmentDetailValue: {
    fontSize: 7,
    color: "#374151",
  },
  observationSection: {
    marginTop: 8,
    backgroundColor: "#fffbe5",
    padding: 6,
    borderRadius: 2,
    borderLeft: "2px solid #fbbf24",
  },
  observationTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#b45309",
    marginBottom: 2,
  },
  observationText: {
    fontSize: 7,
    color: "#92400e",
    lineHeight: 1.2,
  },
  footer: {
    position: "absolute",
    bottom: 10,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #eee",
    paddingTop: 6,
  },
  footerLogo: {
    width: 40,
    height: 20,
  },
  footerText: {
    fontSize: 7,
    color: "#888",
    textAlign: "center",
  },
  pageNumber: {
    fontSize: 7,
    color: "#888",
  },
})

interface GenericPDFSection {
  title: string
  items: Record<string, any>[]
  itemFields: { key: string; label: string }[]
}

interface GenericPDFProps {
  title: string
  columns: { key: string; label: string }[]
  data: Record<string, any>
  detailsField?: string
  sections?: GenericPDFSection[]
}

const equipmentFieldLabels: Record<string, string> = {
  name: "Nome",
  serialNumber: "Número de Série",
  state: "Estado",
  costCenter: "Centro de Custo",
  obs: "Observação",
  equipamento: "Equipamento",
  nome: "Nome",
  estado: "Estado",
  centroCusto: "Centro de Custo",
  observacao: "Observação",
}

function translateFields(fields: { key: string; label: string }[]) {
  return fields.map(field => ({
    ...field,
    label: equipmentFieldLabels[field.key] || field.label
  }))
}


function RegularSection({ section }: { section: GenericPDFSection }) {
  const translatedFields = translateFields(section.itemFields)
  const excludeFromTable = ['observacao', 'observacoes', 'obs', 'observation', 'observations']
  const observationField = section.itemFields.find(field =>
    excludeFromTable.includes(field.key.toLowerCase())
  )
  const tableFields = translatedFields.filter(field =>
    !excludeFromTable.includes(field.key.toLowerCase())
  )

  if (tableFields.length <= 2) {
    return (
      <View style={styles.tableContainer}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {section.items.length === 0 ? (
          <Text style={styles.observationText}>
            {section.title.toLowerCase().includes('equipamento') ? 'Sem equipamento registrado' : `Sem ${section.title.toLowerCase()} registrado`}
          </Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {section.items.map((item, i) => (
              <View key={i} style={styles.equipmentCard}>
                {tableFields.map((field) => (
                  <Text key={field.key} style={{ 
                    fontSize: 10, 
                    fontWeight: field.key === tableFields[0].key ? "bold" : "normal",
                    marginBottom: 3,
                    color: field.key === tableFields[0].key ? "#1e40af" : "#374151"
                  }}>
                    {field.label}: {item[field.key] ?? "-"}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}
        {observationField && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.detailsTitle}>Observações</Text>
            {(() => {
              const obsList = section.items.map((item, i) => {
                const observation =
                  item.obs ??
                  item.observacao ??
                  item.observation ??
                  item.observacoes ??
                  "-";
                if (!observation || observation === '-') return null;
                return (
                  <View key={i} style={styles.observationSection}>
                    <Text style={styles.observationTitle}>
                      {item.nome || item.equipamento || item.description || `Item ${i + 1}`}
                    </Text>
                    <Text style={styles.observationText}>{observation}</Text>
                  </View>
                )
              }).filter(Boolean);
              if (obsList.length === 0) {
                return <Text style={styles.observationText}>Sem Observações</Text>;
              }
              return obsList;
            })()}
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.tableContainer}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.items.length === 0 ? (
        <Text style={styles.observationText}>
          {section.title.toLowerCase().includes('equipamento') ? 'Sem equipamento registrado' : `Sem ${section.title.toLowerCase()} registrado`}
        </Text>
      ) : (
        <>
          <View style={styles.tableHeader}>
            {tableFields.map((field) => (
              <Text key={field.key} style={styles.tableHeaderText}>
                {field.label}
              </Text>
            ))}
          </View>
          {section.items.map((item, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              {tableFields.map((field) => (
                <Text key={field.key} style={styles.tableCell}>
                  {item[field.key] ?? '-'}
                </Text>
              ))}
            </View>
          ))}
        </>
      )}
      {observationField && (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.detailsTitle}>Observações</Text>
          {(() => {
            const obsList = section.items.map((item, i) => {
              const observation =
                item.obs ??
                item.observacao ??
                item.observation ??
                item.observacoes ??
                "-";
              if (!observation || observation === '-') return null;
              return (
                <View key={i} style={styles.observationSection}>
                  <Text style={styles.observationTitle}>
                    {item.nome || item.equipamento || item.description || `Item ${i + 1}`}
                  </Text>
                  <Text style={styles.observationText}>{observation}</Text>
                </View>
              )
            }).filter(Boolean);
            if (obsList.length === 0) {
              return <Text style={styles.observationText}>Sem Observações</Text>;
            }
            return obsList;
          })()}
        </View>
      )}
    </View>
  )
}

export function GenericPDF({ title, columns, data, detailsField, sections }: GenericPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src="/logo.png" style={styles.logo} />
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={{ width: 80 }} />
        </View>

        <Text style={styles.sectionTitle}>Informações Gerais</Text>
        <View style={styles.infoGrid}>
          {columns.map((col) => (
            <View style={styles.infoItem} key={col.key}>
              <Text style={styles.infoLabel}>{col.label}</Text>
              <Text style={styles.infoValue}>{data[col.key] ?? "-"}</Text>
            </View>
          ))}
        </View>

        {sections && sections.map((section, idx) => (
          <RegularSection key={idx} section={section} />
        ))}

      </Page>
    </Document>
  )
}