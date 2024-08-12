'use client';

import { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import ContentPages from '@/components/ContentPages';
import { DummyData, saveAnswers, saveAnswerstest } from '../app/actions';
import { useToast } from './ui/use-toast';
import { ToastAction } from './ui/toast';
import useFormStore from '@/app/tasks/store/useFormStore';
import { useRouter, useSearchParams } from 'next/navigation';

interface StudyWrapperProps {
  data: any[];
  questions: any[];
  group: string | undefined
}

const StudyWrapper: React.FC<StudyWrapperProps> = ({ data, questions, group }) => {
  const { formData, updateFormData } = useFormStore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  


  // Initialize form data with empty objects for each task index if not already initialized
  useEffect(() => {
    data.forEach((_, index) => {
      if (formData[index] === undefined) {
        updateFormData(index, {
          answer: '',
          total_time_spent: 0,
          response_data: [],
        });
      }
    });
  }, [data, formData, updateFormData]);

  const handleAnswerChange = (index: number, value: string) => {
    // Retrieve the existing form data for the task
    const existingData = useFormStore.getState().formData[index] || {};
    const existingResponseData = existingData.response_data || [];

    // Ensure the correct prompt is being updated, and not hardcoded
    const updatedResponseData = existingResponseData.map((item: any) => {
        if (item.prompt) {
            return {
                ...item,
                prompt: {
                    ...item.prompt,
                    // response: value,  // Update only the response here
                },
            };
        }
        return item;
    });

    // Preserve the existing total_time_spent
    const totalTimeSpent = existingData.total_time_spent || 0;

    // Update the form data
    useFormStore.getState().updateFormData(index, {
        ...existingData,
        answer: value,
        total_time_spent: totalTimeSpent, // Preserve the existing time
        response_data: updatedResponseData,
    });

    console.log(useFormStore.getState().formData);
};


  // Handle form submission
  const handleSubmit = async () => {
    console.log('Submitting answers...');

    const prolific_id = "example_prolific_id";
    const grade = 5.0;
    const passed = true;
    const start_time = new Date().toISOString();
    const end_time = new Date().toISOString();

    // Ensure FormData is correctly typed as string for `response_text`
    const dummyDataArray: DummyData[] = Object.entries(formData).map(([index, formDataEntry]) => {
      const questionIndex = parseInt(index, 10);
      const question = questions[questionIndex];

      if (!question) {
        console.error(`Question not found for taskIndex ${index}`);
        return null;
      }

      return {
        created_at: new Date().toISOString(),
        question_id: question.question_id,
        prolific_id,
        response_text: formDataEntry.answer, // Ensure this is the correct field
        response_data: JSON.stringify(formDataEntry), // Correctly stringify response_data
        grade: formDataEntry.response_data?.find((item: any) => item.unfinished_prompt)?.unfinished_prompt?.grade || grade, // Use the specific grade if available
        passed,
        start_time,
        end_time,
      };
    }).filter((data): data is DummyData => data !== null); // Proper type assertion

    console.log('Formatted answers for submission:', dummyDataArray);

    const result = await saveAnswerstest(dummyDataArray);

    toast({
      title: "Saving answers",
      description: "Answers are being saved",
    });

    console.log('Save result:', result);

    if (result.success) {
      const PROLIFIC_PID = searchParams.get("PROLIFIC_PID");
      const STUDY_ID = searchParams.get("STUDY_ID");
      const SESSION_ID = searchParams.get("SESSION_ID");
      const study = searchParams.get("study");
      const group = searchParams.get("group");

      toast({
        title: "Answers saved successfully!",
        description: "You can now go back to Prolific",
      });

      const successUrl = `/success?PROLIFIC_PID=${PROLIFIC_PID}&STUDY_ID=${STUDY_ID}&SESSION_ID=${SESSION_ID}&study=${study}&group=${group}`;

      // Replace the current history entry with the success URL
      window.history.replaceState(null, '', successUrl);

      // Navigate to the success page
      router.replace(successUrl);
    } else {
      toast({
        title: "Error saving answers",
        variant: "destructive",
        description: `Error: ${result.error}`,
        action: (
          <ToastAction className="z-50" altText="Retry saving">
            {`Error: ${result.error}`}
          </ToastAction>
        ),
      });
    }
  };


  return (
    <div className="p-4" style={{ height: 'calc(100vh - 189px)' }}>
      <Navbar data={data} formData={formData} handleSubmit={handleSubmit} updateFormData={updateFormData}/>
      <ContentPages data={data} answers={formData} handleAnswerChange={handleAnswerChange} group={group}/>
    </div>
  );
}

export default StudyWrapper;
