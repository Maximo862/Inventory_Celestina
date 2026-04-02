import { Request, Response, NextFunction } from 'express';
import { getAllBranches, getBranchById } from '../services/branch.Service';

export const branchController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branches = await getAllBranches();
      res.status(200).json(branches);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const branch = await getBranchById(id);
      res.status(200).json(branch);
    } catch (err) {
      next(err);
    }
  }
};