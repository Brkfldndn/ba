'use client';

import { useEffect, useRef } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useSearchParams } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import GPT_ratingv1 from "./GPT_ratingv1";

interface StudyInstruction {
  study_id: number;
  created_at: string;
  titel: string;
  description: string;
  instruction?: string; // Optional field for instruction if needed
}

interface ContentPagesProps {
  data: StudyInstruction[];
  answers: { [key: number]: string };
  handleAnswerChange: (index: number, value: string) => void;
  group: string | undefined;
}

const ContentPages: React.FC<ContentPagesProps> = ({ data, answers, handleAnswerChange, group }) => {
  const searchParam = useSearchParams();
  const taskIndexParam = searchParam.get("index");
  const taskIndex = taskIndexParam ? parseInt(taskIndexParam, 10) : 0;

  const { toast } = useToast();
  const instructionRef = useRef<HTMLDivElement>(null);

  // Ensure taskIndex is within bounds
  if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= data.length) {
    return <div>Invalid task index</div>;
  }

  console.log('Current Task Index:', taskIndex);

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
            <div className="flex flex-col h-full p-6" ref={instructionRef}>
              <div className="font-semibold w-full flex flex-row justify-between items-center">
                <div>Aufgabenstellung</div>
              </div>
              <div>
                {Array.isArray(data) && data.length > 0 && (
                  <div key={taskIndex}>{data[taskIndex]?.instruction || "No instruction provided."}</div>
                )}
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={25}>
            <div className="flex flex-col h-full p-6">
              <div className="font-semibold w-full flex flex-row justify-between items-center">
                <div>Answer</div>
              </div>
              <div className="pt-2 h-full flex flex-col">
                <Textarea
                  className="h-full min-h-[100px] resize-none border p-2 rounded"
                  placeholder="Type your answer here."
                  value={answers[taskIndex] || ""}
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
