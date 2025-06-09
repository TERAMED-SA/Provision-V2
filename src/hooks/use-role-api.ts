"use client"

import instance from "@/lib/api"
import { useState } from "react"

interface Role {
  _id: string
  name: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  roler: number
}

export const useRoleApi = () => {
  const [loadingCount, setLoadingCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const loading = loadingCount > 0

  const fetchUserRole = async (typeId: string): Promise<Role | null> => {
    setLoadingCount(count => count + 1)
    try {
      setError(null)
      const response = await instance.get(`/userAuth/checkType/${typeId}`)
      return response.data.data
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao buscar função do usuário")
      return null
    } finally {
      setLoadingCount(count => count - 1)
    }
  }

  return {
    fetchUserRole,
    loading,
    error,
  }
}
