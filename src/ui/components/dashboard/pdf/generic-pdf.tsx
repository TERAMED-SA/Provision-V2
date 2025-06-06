"use client"

import type React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
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

// Tipos para o gerador de PDF genérico
interface PDFField {
  label: string
  value: string | number | React.ReactNode
  customStyle?: any
}

interface PDFSection {
  title: string
  fields: PDFField[]
}

interface GenericPDFProps {
  title: string
  sections: PDFSection[]
  footer?: string
}

export function GenericPDF({ title, sections, footer = "Gerado pelo sistema" }: GenericPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>

        {sections.map((section, sectionIndex) => (
          <View key={`section-${sectionIndex}`}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            {section.fields.map((field, fieldIndex) => (
              <View key={`field-${sectionIndex}-${fieldIndex}`} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{field.label}:</Text>
                {typeof field.value === "string" || typeof field.value === "number" ? (
                  <Text style={[styles.infoValue, field.customStyle]}>{field.value}</Text>
                ) : (
                  field.value
                )}
              </View>
            ))}

            {sectionIndex < sections.length - 1 && <View style={styles.divider} />}
          </View>
        ))}

        <Text style={styles.footer}>{footer}</Text>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}
