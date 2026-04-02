import { findAllBranches, findBranchById } from '../repositories/branch.Repository';

export async function getAllBranches() {
  return findAllBranches();
}

export async function getBranchById(id: number) {
  const branch = await findBranchById(id);
  if (!branch) {
    throw new Error('Branch not found');
  }
  return branch;
}