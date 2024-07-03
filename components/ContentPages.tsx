"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { Label } from "@radix-ui/react-label";
import GPT from "./GPT";
import { Button } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

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
}

const ContentPages: React.FC<ContentPagesProps> = ({ data, answers, handleAnswerChange }) => {
  const searchParam = useSearchParams();
  const taskIndexParam = searchParam.get("index");
  const taskIndex = taskIndexParam ? parseInt(taskIndexParam, 10) : 0;

  const { toast } = useToast()

  // Ensure taskIndex is within bounds
  if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= data.length) {
    return <div>Invalid task index</div>;
  }

  
  console.log('Current Task Index:', taskIndex);

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
                <div>Aufgabenstellung</div>
                <Button
      variant="outline"
      onClick={() => {
        toast({
          title: "Scheduled: Catch up ",
          description: "Friday, February 10, 2023 at 5:57 PM",
          action: (
            <ToastAction className="z-50" altText="Goto schedule to undo">Undo</ToastAction>
          ),
        })
      }}
    >
      Add to calendar
    </Button>
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
