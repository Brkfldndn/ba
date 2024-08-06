import { fetchStudyInstruction } from "./actions";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MDXRemote } from 'next-mdx-remote/rsc'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Home = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const study = searchParams.study as string;
  const group = searchParams.group as string;
  const PROLIFIC_PID = searchParams.PROLIFIC_PID as string;
  const STUDY_ID = searchParams.STUDY_ID as string;
  const SESSION_ID = searchParams.SESSION_ID as string;

  // Validate study parameter
  if (!study || typeof study !== 'string' || study.length === 0) {
    return (
      <div>
        <h1>Study not available</h1>
      </div>
    );
  }

  const studie = await fetchStudyInstruction(study);

  console.log(`als string:${studie}`)

  // Determine which instruction to use based on the group
  const instruction = group === 'treatment' 
    ? studie.description_treatment 
    : studie.description_control;

  // Split the instruction into parts using $$$ as the delimiter
  const parts = instruction.split('$$$');

  console.log(`als parts:${parts}`)




  return (
    <div className="w-full flex flex-col items-center justify-center" style={{ height: 'calc(100vh - 89px)' }}>
      <div className="text-4xl font-bold justify-center pb-8">
        {studie.titel}
      </div>
      
      <Carousel className="">
        <CarouselContent className=" h-[60vh] aspect-square">
          {parts.map((part: string, index: number) => (
            <CarouselItem key={index}>
              <div className="border-2 w-[58vh] h-full overflow-scroll rounded-3xl p-8">
                <MDXRemote source={part} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext>
          <div className="h-6 w-5 bg-black">-</div>
        </CarouselNext>
      </Carousel>
    </div>
  );
}

export default Home;
