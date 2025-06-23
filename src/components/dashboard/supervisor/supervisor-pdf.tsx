import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Supervisor } from "@/features/application/domain/entities/Supervisor";

const styles = StyleSheet.create({
  page: { padding: 24 },
  section: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  label: { fontSize: 12, fontWeight: "bold" },
  value: { fontSize: 12, marginBottom: 4 },
});

export function SupervisorPDF({ supervisor }: { supervisor: Supervisor }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Detalhes do Supervisor</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Nome:</Text>
          <Text style={styles.value}>{supervisor.name || "N/A"}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Código:</Text>
          <Text style={styles.value}>{supervisor.employeeId || "N/A"}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{supervisor.email || "N/A"}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Telefone:</Text>
          <Text style={styles.value}>{supervisor.phoneNumber || "N/A"}</Text>
        </View>
        {supervisor.equipment && supervisor.equipment.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Equipamentos:</Text>
            {supervisor.equipment.map((equip, idx) => (
              <View key={idx} style={{ marginBottom: 6 }}>
                <Text style={styles.value}>- {equip.name || "N/A"} (Nº Série: {equip.serialNumber || "N/A"})</Text>
              </View>
            ))}
          </View>
        )}
        {supervisor.report && (
          <View style={styles.section}>
            <Text style={styles.label}>Relatório:</Text>
            <Text style={styles.value}>{supervisor.report}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
} 