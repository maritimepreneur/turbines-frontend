import { useState } from 'react'

interface CreatePartnerPayload {
  name: string
  initials: string
  industry: string
  company_type: string
  partner_type: string
  service: string
  goods: string
}

interface CreateContactPayload {
  name: string
  emails: string[]
  phone_numbers: string[]
  company: string
  partner_id: number
}

interface CreateLeadPayload {
  name: string
  period: string
  description: string
  contact_id: number
  partner_id: number
}

export function useLeadsAPI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Base API URL - sesuaikan dengan URL API Anda
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://turbines-murex.vercel.app'

  /**
   * Create Partner
   */
  const createPartner = async (data: CreatePartnerPayload) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/partners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to create partner: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create partner'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Create Contact
   */
  const createContact = async (data: CreateContactPayload) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to create contact: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create contact'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Create Lead
   */
  const createLead = async (data: CreateLeadPayload) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to create lead: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create lead'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createPartner,
    createContact,
    createLead,
    isLoading,
    error,
  }
}