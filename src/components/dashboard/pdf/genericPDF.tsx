"use client"
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 130,
    height: 130,
    objectFit: "contain",
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingRight: 18,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    minWidth: 0,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
    paddingLeft: 18,
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#23272a",
    marginBottom: 4,
    flexWrap: "wrap",
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    letterSpacing: 0.5,
  },
  documentNumber: {
    fontSize: 8,
    textAlign: "center",
    color: "#23272a",
    marginBottom: 12,
    width: "100%",
    alignSelf: "center",
    fontWeight: "bold",
  },
  dateLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 8,
    color: "#23272a",
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "right",
    alignSelf: "flex-end",
    width: "100%",
  },
  companyName: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#23272a",
  },
  companyInfo: {
    marginTop: 10,
    paddingTop: 10,


  },
  clientContainer: {
    borderWidth: 1,
    borderColor: "#23272a",
    padding: 10,
    borderRadius: 4,
    marginBottom: 6,
  },
  clientInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  clientField: {
    width: "48%",
    marginBottom: 6,
  },
  clientLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 6,
  },
  clientValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#23272a",
  },
  serviceDetails: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
    paddingTop: 12,
    marginBottom: 18,
    marginTop: 12,
  },
  serviceDetailItem: {
    flex: 1,
    alignItems: "center",
  },
  serviceDetailLabel: {
    fontSize: 10,
    color: "#23272a",
    marginBottom: 2,
    fontWeight: "bold",
  },
  serviceDetailValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    backgroundColor: "#f3f4f6",
    color: "#23272a",
    padding: 12,
    marginBottom: 16,
    marginTop: 20,
   
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  infoItem: {
    width: "48%",
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#2563eb",
    borderLeftStyle: "solid",
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 10,
    color: "#1a1a1a",
    fontWeight: "bold",
  },
  detailsContainer: {
    backgroundColor: "#f8fafc",
    padding: 10,
    marginBottom: 12,
    borderRadius: 4,
  },
  detailsTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#6b7280",
  },
  tableContainer: {
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  tableHeaderText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 9,
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: "#ffffff",
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: "#f8fafc",
  },
  tableCell: {
    fontSize: 8,
    flex: 1,
    textAlign: "center",
    color: "#1a1a1a",
    fontWeight: "bold",
  },
  equipmentCard: {
    backgroundColor: "#ffffff",
    padding: 10,
    marginBottom: 8,
  },
  equipmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  equipmentName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  equipmentStatus: {
    fontSize: 8,
    padding: 3,
    borderRadius: 3,
    backgroundColor: "#e5e7eb",
    color: "#1a1a1a",
  },
  equipmentDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  equipmentDetailItem: {
    width: "30%",
    marginBottom: 3,
  },
  equipmentDetailLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#6b7280",
  },
  equipmentDetailValue: {
    fontSize: 8,
    color: "#1a1a1a",
    fontWeight: "bold",
  },
  observationSection: {
    marginTop: 10,
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: "#6b7280",
    borderLeftStyle: "solid",
  },
  observationTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 3,
  },
  observationText: {
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.3,
  },
  footer: {
    position: "absolute",
    bottom: 15,
    left: 18,
    right: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#23272a",
    borderTopStyle: "solid",
  },
  footerCompanyName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 2,
  },
  footerCompanyDetails: {
    fontSize: 8,
    marginTop: 4,
    color: "#23272a",
    fontStyle: "italic"
  },
  footerCopyright: {
    fontSize: 8,
    color: "#23272a",
    fontWeight: "bold"
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
  serialNumber: "Nº Série",
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
                    fontWeight: field.key === tableFields[0].key ? "bold" : "bold",
                    marginBottom: 3,
                    color: field.key === tableFields[0].key ? "#2563eb" : "#1a1a1a"
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
  const formatDate = (date: Date = new Date()) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (date: Date = new Date()) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDocumentNumber = () => {
    const year = new Date().getFullYear()
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `Nº ${title.substring(0, 3).toUpperCase()} Nº ${randomNum} /${year}`
  }

  const area = data.area || 'N/A'
  const zona = data.zona || 'N/A'
  const setor = data.setor || 'N/A'
  const supervisor = data.supervisorName || 'N/A'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ marginBottom: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 0 }}>
            <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
              <Image src="/Prometeus_logo.png" style={{ width: 120, height: 60, objectFit: 'contain' }} />
              <Text style={{ fontSize: 10, color: '#444', fontWeight: 'bold', marginTop: 2 }}>PROMETEUS - Serviços Esp. Limpeza e Higiene, Lda.</Text>
            </View>
            <View style={{ flex: 1, flexDirection: "column", width: "100%" }}>
              <View style={{ textAlign: "center", }}>
                <View style={{}}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#444', marginBottom: 4 }}>{title}</Text>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#444', marginBottom: 6 }}>{getDocumentNumber()}</Text>
                </View>
                <View style={{textAlign: "right"}}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#23272a', marginBottom: 2 }}>Data: {formatDate()}</Text>
                </View>
              </View>
                <View style={{ borderWidth: 1, borderColor: '#23272a', padding: 10, borderRadius: 4, width: '100%' }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>Cliente: <Text style={{ fontWeight: 'bold' }}>{data.d || data.d || 'N/A'}</Text></Text>
                  <Text style={{ fontSize: 9, marginBottom: 4 }}>{data.d2 || data.d2 || 'N/A'}</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>Site/Posição: <Text style={{ fontWeight: 'bold' }}>{data.costCenter || data.costCenter || 'N/A'}</Text></Text>
                  <Text style={{ fontSize: 9, marginBottom: 4 }}>{data.siteName || data.siteName || 'N/A'}</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>Morada: <Text style={{ fontWeight: 'bold' }}>{data.morada || data.address || 'N/A'}</Text></Text>
              </View>

            </View>
          </View>

          <View style={{ borderBottomWidth: 1, borderBottomColor: '#23272a', borderBottomStyle: 'solid', marginTop: 24, marginBottom: 2 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 8 }}>
            <Text style={{ fontSize: 10, marginRight: 8 }}>Area: <Text style={{ fontWeight: 'bold' }}>{area}</Text></Text>
            <Text style={{ fontSize: 10, marginRight: 8 }}>Zona: <Text style={{ fontWeight: 'bold' }}>{zona}</Text></Text>
            <Text style={{ fontSize: 10, marginRight: 8 }}>Sector: <Text style={{ fontWeight: 'bold' }}>{setor}</Text></Text>
            <Text style={{ fontSize: 10, marginRight: 8 }}>Supervisor: <Text style={{ fontWeight: 'bold' }}>{supervisor}</Text></Text>
          </View>
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#23272a', borderBottomStyle: 'solid', marginBottom: 24 }} />
        </View>

        {sections && sections.map((section, idx) => (
          <RegularSection key={idx} section={section} />
        ))}

        <View style={styles.footer}>
            <Text style={styles.footerCopyright}>
              © Provision {new Date().getFullYear()} - PROMETEUS - Serviços Esp. Limpeza e Higiene, Lda.
            </Text>
            <Text style={styles.footerCompanyDetails}>
              {data.siteName || "N/A"} {getDocumentNumber()} {formatDateTime()}
            </Text>
        </View>
      </Page>
    </Document>
  )
}