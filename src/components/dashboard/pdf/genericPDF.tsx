"use client"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    padding: 8,
    marginBottom: 10,
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  infoLabel: {
    width: "40%",
    fontWeight: "bold",
    fontSize: 10,
  },
  infoValue: {
    width: "60%",
    fontSize: 10,
  },
  detailsContainer: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    fontSize: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "50%",
    padding: 5,
  },
  itemCard: {
    border: "1px solid #eaeaea",
    padding: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#666",
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 30,
    fontSize: 8,
    color: "#666",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    marginVertical: 10,
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

function SectionTable({ section }: { section: GenericPDFSection }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eaeaea', backgroundColor: '#f5f5f5' }}>
        {section.itemFields.map((field, idx) => (
          <Text key={field.key} style={{ fontWeight: 'bold', fontSize: 10, flex: 1, padding: 4 }}>{field.label}</Text>
        ))}
      </View>
      {section.items.map((item, i) => (
        <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eaeaea' }}>
          {section.itemFields.map((field, idx) => (
            <Text key={field.key} style={{ fontSize: 10, flex: 1, padding: 4 }}>{item[field.key] ?? '-'}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

export function GenericPDF({ title, columns, data, detailsField, sections }: GenericPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View>
          <Text style={styles.sectionTitle}>INFORMAÇÕES GERAIS</Text>
          {columns.map((col) => (
            <View style={styles.infoRow} key={col.key}>
              <Text style={styles.infoLabel}>{col.label}:</Text>
              <Text style={styles.infoValue}>{data[col.key] ?? "-"}</Text>
            </View>
          ))}
        </View>

        {detailsField && data[detailsField] && (
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>DETALHES</Text>
            <Text>{data[detailsField]}</Text>
          </View>
        )}

        {sections && sections.map((section, idx) => (
          section.itemFields.length > 2
            ? <SectionTable key={idx} section={section} />
            : (
              <View key={idx}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.gridContainer}>
                  {section.items.map((item, i) => (
                    <View key={i} style={styles.gridItem}>
                      <View style={styles.itemCard}>
                        {section.itemFields.map((field) => (
                          <Text key={field.key} style={{ fontSize: 10, fontWeight: field.key === section.itemFields[0].key ? "bold" : "normal" }}>
                            {field.label}: {item[field.key] ?? "-"}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )
        ))}

        <Text style={styles.footer}>
          Relatório gerado em {new Date().toLocaleDateString()}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} />
      </Page>
    </Document>
  )
}
