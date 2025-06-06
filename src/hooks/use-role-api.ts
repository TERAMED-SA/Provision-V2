"use client"

import { useState } from "react"
import instance from "@/src/lib/api"

interface Role {
  _id: string
  name: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  roler: number
}

export const useRoleApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserRole = async (typeId: string): Promise<Role | null> => {
    try {
      setLoading(true)
      setError(null)
      const response = await instance.get(`/userAuth/checkType/${typeId}`)
      return response.data.data
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao buscar função do usuário")
      return null
    } finally {
      setLoading(false)
    }
  }



  return {
    fetchUserRole,
    loading,
    error,
  }
}
