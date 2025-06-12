"use client"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { Occurrence } from "@/features/application/domain/entities/Occurrence"

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 40,
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
  priorityBadge: {
    padding: 4,
    borderRadius: 4,
    fontSize: 10,
    textAlign: "center",
    width: "80%",
  },
  priorityLow: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  priorityMedium: {
    backgroundColor: "#fef9c3",
    color: "#854d0e",
  },
  priorityHigh: {
    backgroundColor: "#ffedd5",
    color: "#9a3412",
  },
  priorityCritical: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
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

interface OccurrencePDFProps {
  notification: Occurrence
  getPriorityLabel: (priority: string) => string
}

export function OccurrencePDF({ notification, getPriorityLabel }: OccurrencePDFProps) {
  // Get priority style
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "BAIXA":
        return styles.priorityLow
      case "MEDIA":
        return styles.priorityMedium
      case "ALTA":
        return styles.priorityHigh
      case "CRITICA":
        return styles.priorityCritical
      default:
        return styles.priorityLow
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>RELATÓRIO DE OCORRÊNCIA</Text>
        </View>

        <View>
          <Text style={styles.sectionTitle}>INFORMAÇÕES GERAIS</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Local:</Text>
            <Text style={styles.infoValue}>{notification.siteName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Centro de Custo:</Text>
            <Text style={styles.infoValue}>{notification.costCenter}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Supervisor:</Text>
            <Text style={styles.infoValue}>{notification.supervisorName || "Não informado"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data:</Text>
            <Text style={styles.infoValue}>{notification.createdAt}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hora:</Text>
            <Text style={styles.infoValue}>{notification.createdAtTime}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Prioridade:</Text>
            <Text style={[styles.infoValue, getPriorityStyle(notification.priority)]}>
              {getPriorityLabel(notification.priority)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Número de Trabalhadores:</Text>
            <Text style={styles.infoValue}>{notification.numberOfWorkers || 0}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>DETALHES</Text>
          <Text>{notification.details || "Sem detalhes disponíveis."}</Text>
        </View>

        {notification.workerInformation && notification.workerInformation.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>TRABALHADORES</Text>
            <View style={styles.gridContainer}>
              {notification.workerInformation.map((worker, index) => (
                <View key={index} style={styles.gridItem}>
                  <View style={styles.itemCard}>
                    <Text style={{ fontSize: 10, fontWeight: "bold" }}>{worker.name}</Text>
                    <Text style={{ fontSize: 8 }}>Nº {worker.employeeNumber}</Text>
                    <Text style={{ fontSize: 8 }}>Estado: {worker.state}</Text>
                    {worker.obs && <Text style={{ fontSize: 8 }}>Obs: {worker.obs}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {notification.equipment && notification.equipment.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>EQUIPAMENTOS</Text>
            <View style={styles.gridContainer}>
              {notification.equipment.map((equip, index) => (
                <View key={index} style={styles.gridItem}>
                  <View style={styles.itemCard}>
                    <Text style={{ fontSize: 10, fontWeight: "bold" }}>{equip.name}</Text>
                    <Text style={{ fontSize: 8 }}>Nº Série: {equip.serialNumber}</Text>
                    <Text style={{ fontSize: 8 }}>Estado: {equip.state}</Text>
                    <Text style={{ fontSize: 8 }}>Centro de Custo: {equip.costCenter}</Text>
                    {equip.obs && <Text style={{ fontSize: 8 }}>Obs: {equip.obs}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

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
