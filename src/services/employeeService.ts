import axiosInstance from '@/lib/axios'

export interface Employee {
  id: number
  full_name: string
  employee_code: string
  email: string
}

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
    const response = await axiosInstance.get('/api/employees/')
    return Array.isArray(response.data) ? response.data : (response.data?.data ?? [])
  },
}
