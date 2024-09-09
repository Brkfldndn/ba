'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";
import Stopwatch from "@/components/StopWatch";
import Link from "next/link";
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

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
import { Textarea } from "./ui/textarea";
import { saveCritique } from "@/app/actions";
import { toast } from "./ui/use-toast";

interface StudyInstruction {
  study_id: number;
  created_at: string;
  titel: string;
  description: string;
  instruction?: string;
}


interface NavbarProps {
  data: StudyInstruction[];
  formData: { [key: number]: any };
  updateFormData: (index: number, value: any) => void; // Add this prop
  handleSubmit: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ data, formData, updateFormData, handleSubmit }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const previousTaskIndex = useRef<number | null>(null);

  // Extract existing URL parameters
  const PROLIFIC_PID = searchParams.get("PROLIFIC_PID") || undefined;
  const STUDY_ID = searchParams.get("STUDY_ID");
  const SESSION_ID = searchParams.get("SESSION_ID");
  const study = searchParams.get("study");
  const group = searchParams.get("group");

  // Get and parse taskIndex from URL parameters
  const taskIndexParam = searchParams.get("index");
  const taskIndex = taskIndexParam ? parseInt(taskIndexParam, 10) : 0;


  const [sliderValue1, setSliderValue1] = useState(5);
  const [sliderValue2, setSliderValue2] = useState(5);
  const [sliderMoved1, setSliderMoved1] = useState(false); 
  const [sliderMoved2, setSliderMoved2] = useState(false);
  const [textInput, setTextInput] = useState("");






// useEffect to start the timer on component mount
useEffect(() => {
  // Set the start time when the component mounts
  setStartTime(new Date());

  // Cleanup on unmount
  return () => {
    updateTimeSpent();
  };
}, []);

// Function to handle time tracking and updating total_time_spent
const updateTimeSpent = () => {
  if (startTime) {
    const endTime = new Date();
    const timeSpent = (endTime.getTime() - startTime.getTime()) / 1000; // Calculate time in seconds

    if (previousTaskIndex.current !== null) {
      // Retrieve the previous data from the store
      const previousAnswerData = { ...formData[previousTaskIndex.current] } || {};
      
      // Retrieve the previously accumulated time for the task
      const previousTotalTimeSpent = previousAnswerData.total_time_spent || 0;

      console.log('prevTIme:', previousTotalTimeSpent);

      // Accumulate the new time spent
      const newTotalTimeSpent = previousTotalTimeSpent + timeSpent;
      previousAnswerData.total_time_spent = newTotalTimeSpent;

      console.log('Updated time spent:', previousAnswerData);

      // Update the formData with the new total_time_spent
      updateFormData(previousTaskIndex.current, previousAnswerData);
    }

    // Set the current task as the previous one and reset the start time
    previousTaskIndex.current = taskIndex;
    setStartTime(new Date());
  }
};


// Call updateTimeSpent whenever the task index changes
useEffect(() => {
  updateTimeSpent();
}, [taskIndex]);








  // Handle navigation to the next task
  const handleNextTask = () => {
    updateTimeSpent();
    if (taskIndex < data.length - 1) {
      router.push(
        `?PROLIFIC_PID=${PROLIFIC_PID}&STUDY_ID=${STUDY_ID}&SESSION_ID=${SESSION_ID}&study=${study}&index=${taskIndex + 1}&group=${group}`
      );
    }
  };

  // Handle navigation to the previous task
  const handlePreviousTask = () => {
    updateTimeSpent();
    if (taskIndex > 0) {
      router.push(
        `?PROLIFIC_PID=${PROLIFIC_PID}&STUDY_ID=${STUDY_ID}&SESSION_ID=${SESSION_ID}&study=${study}&index=${taskIndex - 1}&group=${group}`
      );
    }
  };

  // Handle navigation to a specific task
  const handleTaskClick = (index: number) => {
    updateTimeSpent();
    router.push(
      `?PROLIFIC_PID=${PROLIFIC_PID}&STUDY_ID=${STUDY_ID}&SESSION_ID=${SESSION_ID}&study=${study}&index=${index}&group=${group}`
    );
  };


  const handleCritique = async () => {
    const critiqueData = {
      sliderValue1,
      sliderValue2,
      textInput,
      PROLIFIC_PID,
    };

    const response = await saveCritique(critiqueData);

    if (response.success) {
      // alert("Form submitted successfully!");
    } else {
      toast({
        title: "Error saving critique",
        variant: "destructive",
        description: `Error: ${response.error}`
      });
    }
  };



  const handleFormSubmission = () => {
    // Dynamically check if all conditions are met
    const isFormValid = sliderMoved1 && sliderMoved2 && textInput.trim().length > 0;
  
    if (isFormValid) {
      if (group === "treatment") {
        handleCritique();
      }
      handleSubmit();
    } else {
      toast({
        title: "Error",
        description: "You need to fill out the form completely before submitting.",
        variant: "destructive",
      });
    }
  };

  const markSliderMoved = (setSliderMoved: React.Dispatch<React.SetStateAction<boolean>>) => {
    setSliderMoved(true); // Mark slider as moved on click as well as value change
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
      <div className="flex flex-row items-center gap-2">
        {data.map((_, index) => {
          const isCurrentTask = index === taskIndex;
          const taskData = formData[index]; // Access the form data for the current task
          const hasAnswer = taskData && taskData.answer && taskData.answer !== ""; // Check if the answer exists and is not empty
          
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
            <Button className="left-3 top-3 p-1 px-4 flex flex-row items-center gap-3 border-2 border-white border-opacity-100 bg-[#21d9c3] text-white hover:bg-white hover:border-[#21d9c3] hover:text-[#21d9c3]" onClick={updateTimeSpent}>
              <div>Submit</div>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="">
            <AlertDialogHeader>
            <AlertDialogTitle>{group === "treatment" ? "Please Help Us Improve the Tool!" : "Are you sure?"}</AlertDialogTitle>
              <AlertDialogDescription className="">
                {group === "treatment" ? (
                  <div className="flex flex-col gap-4">
                    {/* <div>Please Help Us Improve the Tool!</div> */}

                    <div className="flex flex-col gap-2 border-b pb-2">
                      <label className="font-medium">Did you like working with the tool?(ChatGPT-extension)</label>
                      <div className="px-7">
                      <div className="flex justify-between text-sm px-2 pb-4">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                        <Slider
                        defaultValue={[2]}
                        max={4}
                        step={1}
                        onValueChange={([value]) => {
                          setSliderValue1(value);
                          setSliderMoved1(true); // Mark slider as moved when interacted with
                        }}
                        onClick={() => markSliderMoved(setSliderMoved1)}
                        className={`transition-opacity duration-300 ${sliderMoved1 ? "opacity-100" : "opacity-50"}`} 
                      />
                      
                      </div>
                      
                      
                      <div className="flex justify-between text-xs px-1">
                        <div>Does not apply at all</div>
                        <div>Fully applies</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 border-b pb-2">
                      <label className="font-medium">Do you feel like you could improve the quality of you work when having access to the tool ?</label>
                      <div className="px-7">
                        <div className="flex justify-between text-sm px-2 pb-4">
                          <span>1</span>
                          <span>2</span>
                          <span>3</span>
                          <span>4</span>
                          <span>5</span>
                        </div>
                        <Slider
                        defaultValue={[2]}
                        max={4}
                        step={1}
                        onValueChange={([value]) => {
                          setSliderValue2(value);
                          setSliderMoved2(true); // Mark slider as moved when interacted with
                        }}
                        onClick={() => markSliderMoved(setSliderMoved2)}
                        className={`transition-opacity duration-300  ${sliderMoved2 ? "opacity-100" : "opacity-50"}`} 
                      />
                      </div>
                      
                      <div className="flex justify-between text-xs px-1">
                        <div>Does not apply at all</div>
                        <div>Fully applies</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 pt-5">
                      <label className="font-semibold">How was your overall experience with the tool? What could we improve?</label>
                      <Textarea
                        className="min-h-[30px] max-h-18 h-16 resize-none border p-2 rounded"
                        placeholder="Please share your thoughts..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    By submitting you cannot change answers. Make sure to answer all the questions.
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleFormSubmission}>Submit</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Navbar;
