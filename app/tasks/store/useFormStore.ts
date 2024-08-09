import create from 'zustand';

interface PromptData {
  text: string;
  response: string;
}

interface UnfinishedPromptData {
  text: string;
  prompt_replacement: {
    replacement_text: string;
    grade: number | null;
  };
  grade: number | null;
  suggestions: string[];
}

interface ResponseData {
  prompt: PromptData;
  unfinished_prompt: UnfinishedPromptData;
}

interface FormData {
  answer: string;
  total_time_spent: number;
  response_data: ResponseData;
}

interface FormStore {
  formData: {
    [key: number]: FormData;
  };
  updateFormData: (index: number, data: Partial<FormData>) => void;
}

const useFormStore = create<FormStore>((set) => ({
  formData: {},
  updateFormData: (index, data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [index]: {
          ...state.formData[index],
          ...data,
        },
      },
    })),
}));

export default useFormStore;
