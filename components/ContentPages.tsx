'use client';

import { useEffect, useRef, useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useSearchParams } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import GPT_ratingv1 from "./GPT_ratingv1";
import { MDXRemote } from 'next-mdx-remote/rsc';
import Markdown from 'react-markdown';
import Stopwatch from './StopWatch';

interface StudyInstruction {
  study_id: number;
  created_at: string;
  titel: string;
  description: string;
  instruction?: any; // Optional field for instruction if needed
}

interface AnswerData {
  answer: string;
  // Add more fields as necessary
}

interface ContentPagesProps {
  data: StudyInstruction[];
  answers: { [key: number]: AnswerData };
  handleAnswerChange: (index: number, value: string) => void;
  group: string | undefined;
}

const ContentPages: React.FC<ContentPagesProps> = ({ data, answers, handleAnswerChange, group }) => {
  const searchParam = useSearchParams();
  const taskIndexParam = searchParam.get("index");
  const [taskIndex, setTaskIndex] = useState(taskIndexParam ? parseInt(taskIndexParam, 10) : 0); // Added useState for taskIndex

  const { toast } = useToast();
  const instructionRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const taskIndexParam = searchParam.get("index");
    setTaskIndex(taskIndexParam ? parseInt(taskIndexParam, 10) : 0);
  }, [searchParam]);

  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      if (instructionRef.current && instructionRef.current.contains(e.target as Node)) {
        e.preventDefault();
        e.clipboardData?.clearData();
        toast({
          title: "Copy not allowed",
          description: "The text cannot be copied.",
        });
      }
    };

    document.addEventListener('copy', handleCopy);
    return () => {
      document.removeEventListener('copy', handleCopy);
    };
  }, [toast]);

  if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= data.length) {
    return <div>Invalid task index</div>;
  }

  console.log('Current Task Index:', taskIndex);

  return (
    <ResizablePanelGroup direction="horizontal" className="w-full rounded-lg border">
      <ResizablePanel defaultSize={50} className="relative">
        <div className="flex flex-col p-3 h-full">
          <GPT_ratingv1 group={group} />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={75}>
            <div ref={instructionRef} className="flex flex-col h-full px-6 pt-6 w-full">
              <div className="font-semibold w-full flex flex-row justify-between items-center">
                <div className="text-lg">Task {taskIndex + 1}</div>
              </div>
              <div  className="overflow-scroll h-full w-full">
                {Array.isArray(data) && data.length > 0 && (
                  <div className='overflow-scroll h-full prose max-w-none pb-24'>
                    <Markdown
                      components={{
                        img: ({ ...props }) => (
                          <img {...props} className="max-w-[50vw] w-full h-auto mx-auto" />
                        ),
                      }}
                    >
                      {data[taskIndex]?.instruction}
                    </Markdown>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={25}>
            <div className="flex flex-col h-full p-6">
              <div className="font-semibold w-full flex flex-row justify-between items-center">
                <div>Answer</div>
                <Stopwatch />
              </div>
              <div className="pt-2 h-full flex flex-col">
                <Textarea
                  className="h-full min-h-[100px] resize-none border p-2 rounded"
                  placeholder="Type your answer here."
                  value={answers[taskIndex]?.answer || ""}
                  onChange={(e) => handleAnswerChange(taskIndex, e.target.value)}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ContentPages;
