"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";
import Stopwatch from "@/components/StopWatch";
import Link from "next/link";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StudyInstruction {
  study_id: number;
  created_at: string;
  titel: string;
  description: string;
  instruction?: string; // Optional field for instruction if needed
}

interface NavbarProps {
  data: StudyInstruction[];
  formData: { [key: number]: string };
  handleSubmit: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ data, formData, handleSubmit }) => {
  console.log("Navbar component data:", data);
  console.log(data.length);
  console.log("FormData:", formData); // Added logging
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract existing URL parameters
  const PROLIFIC_PID = searchParams.get("PROLIFIC_PID");
  const STUDY_ID = searchParams.get("STUDY_ID");
  const SESSION_ID = searchParams.get("SESSION_ID");
  const study = searchParams.get("study");
  const group = searchParams.get("group");

  // Get and parse taskIndex from URL parameters
  const taskIndexParam = searchParams.get("index");
  const taskIndex = taskIndexParam ? parseInt(taskIndexParam, 10) : 0;

  // Handle navigation to the next task
  const handleNextTask = () => {
    if (taskIndex < data.length - 1) {
      router.push(
        `?PROLIFIC_PID=${PROLIFIC_PID}&STUDY_ID=${STUDY_ID}&SESSION_ID=${SESSION_ID}&study=${study}&index=${taskIndex + 1}&group=${group}`
      );
    }
  };

  // Handle navigation to the previous task
  const handlePreviousTask = () => {
    if (taskIndex > 0) {
      router.push(
        `?PROLIFIC_PID=${PROLIFIC_PID}&STUDY_ID=${STUDY_ID}&SESSION_ID=${SESSION_ID}&study=${study}&index=${taskIndex - 1}&group=${group}`
      );
    }
  };

  // Handle navigation to a specific task
  const handleTaskClick = (index: number) => {
    router.push(
      `?PROLIFIC_PID=${PROLIFIC_PID}&STUDY_ID=${STUDY_ID}&SESSION_ID=${SESSION_ID}&study=${study}&index=${index}&group=${group}`
    );
  };

  return (
    <div className="mb-3 relative flex flex-row justify-between items-center">
      <Button
        className="right-3 top-3 p-1 px-4 flex flex-row items-center justify-center gap-4"
        onClick={handlePreviousTask}
        disabled={taskIndex <= 0}
      >
        <FaArrowLeft size={15} rotate={90} />
        <div>{`Task ${taskIndex}`}</div>
      </Button>
      {/* <div className="flex flex-row items-center justify-center gap-5 ">
        <div className="font-semibold text-xl">{`Task ${taskIndex + 1}`}</div>
        <Stopwatch />
      </div> */}
      <div className="flex flex-row items-center gap-2">
        {data.map((_, index) => {
          const isCurrentTask = index === taskIndex;
          const hasAnswer = formData && formData[index] !== undefined && formData[index] !== "";
          console.log(`Index ${index}: ${hasAnswer ? "Has answer" : "No answer"}`); // Added logging
          return (
            <div
              key={index}
              className={`w-8 h-10 rounded-md flex flex-col items-center justify-center cursor-pointer ${
                isCurrentTask
                  ? "border-2 border-black"
                  : hasAnswer
                  ? "bg-gray-300"
                  : "bg-white"
              }`}
              onClick={() => handleTaskClick(index)}
            >
              {index + 1}
            </div>
          );
        })}
      </div>
      {taskIndex < data.length - 1 ? (
        <Button
          className="left-3 top-3 p-1 px-4 flex flex-row items-center gap-3"
          onClick={handleNextTask}
        >
          <div>{`Next Task`}</div>
          <FaArrowRight size={15} />
        </Button>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="left-3 top-3 p-1 px-4 flex flex-row items-center gap-3 border-2 border-white border-opacity-100 bg-[#21d9c3] text-white hover:bg-white hover:border-[#21d9c3] hover:text-[#21d9c3]">
              <div>Submit</div>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                By submitting you cannot change answers. Make sure to answer
                all the questions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit}>
                Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Navbar;
