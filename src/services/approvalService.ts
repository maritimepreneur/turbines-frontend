import axiosInstance from "@/lib/axios"
import { ApprovalPostRequest, ApprovalUpdateRequest } from "@/types/approval"

// GET LIST
export const getApprovals = async (page = 1) => {
  const response = await axiosInstance.get(`/api/approvals/?page=${page}`)
  return response.data
}

// CREATE
export const createApproval = async (payload: ApprovalPostRequest) => {
  return await axiosInstance.post(
    "/api/approvals/create",
    payload
  )
}

// UPDATE STATUS
export const updateApprovalStatus = async (
  id: number,
  data: ApprovalUpdateRequest
) => {
  return await axiosInstance.put(
    `/api/approvals/update/${id}`,
    data
  )
}

// DELETE
export const deleteApproval = async (id: number) => {
  return await axiosInstance.delete(
    `/api/approvals/${id}`
  )
}