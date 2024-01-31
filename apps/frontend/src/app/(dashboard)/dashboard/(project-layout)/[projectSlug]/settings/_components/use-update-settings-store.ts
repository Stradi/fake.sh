import { create } from 'zustand';

export type UpdateSettingsStore = {
  originalProject: {
    name: string;
    slug: string;
  };
  project: {
    name: string;
    slug: string;
  };
  hasChanges: boolean;

  setOriginalProject: (project: { name: string; slug: string }) => void;
  setProject: (project: { name?: string; slug?: string }) => void;
  setHasChanges: (hasChanges: boolean) => void;
};

const useUpdateSettingsStore = create<UpdateSettingsStore>((set) => ({
  originalProject: {
    name: '',
    slug: '',
  },
  project: {
    name: '',
    slug: '',
  },
  hasChanges: false,

  setOriginalProject: (project) => {
    set((state) => ({
      originalProject: {
        ...state.originalProject,
        ...project,
      },
    }));
  },
  setProject: (project) => {
    set((state) => ({
      project: {
        ...state.project,
        ...project,
      },
    }));
  },
  setHasChanges: (hasChanges) => {
    set({ hasChanges });
  },
}));

export default useUpdateSettingsStore;
