import { fetchAPI } from "@/utils/fetchHelper";
import type { Branch } from "@/types/types";

export const getBranchesRequest = () =>
  fetchAPI<Branch[]>("/branches");

export const getBranchByIdRequest = (id: number) =>
  fetchAPI<Branch>(`/branches/${id}`);