import { create } from 'zustand';

interface DashboardState {
  date: Date;
  page: number;
}

interface DashboardActions {
  setDate: (date: Date) => void;
  setPage: (page: number) => void;
}

type DashboardStore = DashboardState & DashboardActions;

export const useDashboard = create<DashboardStore>()((set) => ({
  date: new Date(),
  page: 1,
  setDate: (date) => set({ date }),
  setPage: (page) => set({ page }),
}));
