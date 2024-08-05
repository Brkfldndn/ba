'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    // Initialize form data with empty strings for each task index if not already initialized
    data.forEach((_, index) => {
      if (formData[index] === undefined) {
        updateFormData(index, '');
        // console.log(formData);
      }
    });
  }, [data, formData, updateFormData]);

  const handleAnswerChange = (index: number, value: string) => {
    updateFormData(index, value);
    // toast({
    //   title: "Answer saved",
    //   description: `Answer for task ${index} saved.`,
    //   action: (
    //     <ToastAction className="z-50" altText="Goto schedule to undo">{value} ${index}</ToastAction>
    //   ),
    // });
    console.log(formData);
    console.log(questions);
  };

  const handleSubmit = async () => {
    console.log('Submitting answers...');

    const prolific_id = "example_prolific_id";
    const grade = 5.0;
    const passed = true;
    const start_time = new Date().toISOString();
    const end_time = new Date().toISOString();

    // Create the dummyDataArray by combining questions and formData
    const dummyDataArray: DummyData[] = Object.entries(formData).map(([index, answer]) => {
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
        response_text: answer,
        response_data: JSON.stringify({ taskIndex: index, answer }),
        grade,
        passed,
        start_time,
        end_time,
      };
    }).filter((data): data is DummyData => data !== null); // Type guard to filter out null values

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
        const study = searchParams.get("study")
  
        toast({
          title: "Answers saved successfully!",
          description: "You can now go back to Prolific",
        });
  
        const successUrl = `/success?PROLIFIC_PID=${PROLIFIC_PID}&STUDY_ID=${STUDY_ID}&SESSION_ID=${SESSION_ID}&study=${study}`;
      
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
      <Navbar data={data} formData={formData} handleSubmit={handleSubmit} />
      <ContentPages data={data} answers={formData} handleAnswerChange={handleAnswerChange} group={group}/>
    </div>
  );
}

export default StudyWrapper;
