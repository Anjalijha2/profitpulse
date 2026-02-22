import { create } from 'zustand';
import dayjs from 'dayjs';

export const useUiStore = create((set) => ({
    sidebarCollapsed: false,
    selectedMonth: dayjs().startOf('month'),
    selectedDept: null,

    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    setSelectedMonth: (date) => set({ selectedMonth: date }),
    setSelectedDept: (deptId) => set({ selectedDept: deptId }),
}));
