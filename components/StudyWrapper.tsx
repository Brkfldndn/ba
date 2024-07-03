'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ContentPages from '@/components/ContentPages';
import { saveAnswers } from '../app/actions';
import { useToast } from './ui/use-toast';
import { ToastAction } from './ui/toast';
import { Router } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Answers {
  [key: number]: string;
}

interface StudyWrapperProps {
  data: any[];
}

const StudyWrapper: React.FC<StudyWrapperProps> = ({ data }) => {
  const [answers, setAnswers] = useState<Answers>({});
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Initialize answers with empty strings for each task index
    const initialAnswers: Answers = {};
    data.forEach((_, index) => {
      initialAnswers[index] = '';
    });
    setAnswers(initialAnswers);
  }, [data]);

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
    console.log(answers)
    toast({
        title: "Scheduled: Catch up ",
        description: "Friday, February 10, 2023 at 5:57 PM",
        action: (
          <ToastAction className="z-50" altText="Goto schedule to undo">{value}${index}</ToastAction>
        ),
      })
  }

  const handleSubmit = async () => {
    const result = await saveAnswers(answers);
    if (result.success) {
        router.push("/success")
        toast({
            title: "Scheduled: submit",
            description: "Friday, February 10, 2023 at 5:57 PM",
            action: (
                <ToastAction className="z-50" altText="Goto schedule to undo">
                    {`undefined`}
                </ToastAction>
            ),
        });
        
    } else {
    //   alert('Error saving answers: ' + result.error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
            })
      
    }
  }

  return (
    <div className="p-4" style={{ height: 'calc(100vh - 189px)' }}>
      <Navbar data={data} handleSubmit={handleSubmit} />
      <ContentPages data={data} answers={answers} handleAnswerChange={handleAnswerChange} />
    </div>
  );
}

export default StudyWrapper;
