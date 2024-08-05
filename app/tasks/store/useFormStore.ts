import create from 'zustand';

interface FormData {
  [key: number]: string;
}

interface FormStore {
  formData: FormData;
  updateFormData: (index: number, value: string) => void;
}

const useFormStore = create<FormStore>((set) => ({
  formData: {},
  updateFormData: (index, value) => set((state) => ({
    formData: {
      ...state.formData,
      [index]: value,
    },
  })),
}));

export default useFormStore;
