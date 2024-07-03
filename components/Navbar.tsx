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
} from "@/components/ui/alert-dialog"


interface StudyInstruction {
  study_id: number;
  created_at: string;
  titel: string;
  description: string;
  instruction?: string; // Optional field for instruction if needed
}

interface NavbarProps {
  data: StudyInstruction[];
  handleSubmit: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ data, handleSubmit }) => {
  console.log('Navbar component data:', data);
  
  console.log(data.length)
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get and parse taskIndex from URL parameters
  const taskIndexParam = searchParams.get("index");
  const taskIndex = taskIndexParam ? parseInt(taskIndexParam, 10) : 0;

  // Handle navigation to the next task
  const handleNextTask = () => {
    if (taskIndex < data.length - 1) {
      router.push(`?study=${data[0].study_id}&index=${taskIndex + 1}`);
    }
  };

  // Handle navigation to the previous task
  const handlePreviousTask = () => {
    if (taskIndex > 0) {
      router.push(`?study=${data[0].study_id}&index=${taskIndex - 1}`);
    }
  };

  // // Handle submission on the last task
  // const handleSubmit = () => {
  //   // Logic for submission can be added here
  //   console.log("Submitted");
  // };

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
      <div className="flex flex-row items-center justify-center gap-5 ">
        <div className="font-semibold text-xl">{`Task ${taskIndex + 1}`}</div>
        <Stopwatch />
      </div>
      {taskIndex < data.length - 1 ? (
        <Button 
          className="left-3 top-3 p-1 px-4 flex flex-row items-center gap-3" 
          onClick={handleNextTask}
        >
          <div>{`Task ${taskIndex + 1} of ${data.length}`}</div>
          <FaArrowRight size={15} />
        </Button>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            {/* <Link href={"/success"}> */}
                <Button 
                  className="left-3 top-3 p-1 px-4 flex flex-row items-center gap-3 border-2 border-white border-opacity-100 bg-[#21d9c3] text-white hover:bg-white hover:border-[#21d9c3] hover:text-[#21d9c3]" 
                  onClick={handleSubmit}
                >
                  <div>Submit</div>
                </Button>
              {/* </Link> */}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                By submitting you....
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>
                <Link href={"/success"}></Link>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        
      )}
    </div>
  );
};

export default Navbar;
