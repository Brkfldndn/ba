"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import GPT from "./GPT";
import { Textarea } from "./ui/textarea";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";

interface Answers {
  [key: string]: string;
}

interface ContentPagesProps {
  data: any[];
  answers: Answers;
  onAnswerChange: (index: string, value: string) => void;
}

const ContentPages: React.FC<ContentPagesProps> = ({ data, answers, onAnswerChange }) => {
  const searchParam = useSearchParams()
  const taskIndex = searchParam.get("index")
  console.log(taskIndex)
    
  return (
    <ResizablePanelGroup direction="horizontal" className="w-full rounded-lg border">
      <ResizablePanel defaultSize={50} className="relative">
        <div className="flex flex-col p-3 h-full">
          <GPT/>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={75}>
            <div className="flex flex-col h-full p-6">
              <div className="font-semibold w-full flex flex-row justify-between items-center">
                <div>Aufgabenstellung </div>
              </div>
              <div>
                {Array.isArray(data) && data.length > 0 && (
                  <div key={taskIndex}>{data[taskIndex].instruction}</div>
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
                  id="message-1"
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
