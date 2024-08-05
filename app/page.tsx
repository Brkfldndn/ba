import { fetchStudyInstruction } from "./actions";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"


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

  // let data;

  // try {
  //   data = await fetchStudyInstruction(study);
  //   console.log(data);
  // } catch (error) {
  //   console.error('Error fetching data:', error);
  //   data = [];
  // }


  // try {
  //   const studie = await fetchStudyInstruction(study);
  //   console.log(`studien: ${JSON.stringify(studie)}`);
  //   data = studie; // The data is now expected to be a single object
  // } catch (error) {
  //   console.error('Error fetching data:', error);
  //   data = null;
  // }


  const studie = await fetchStudyInstruction(study);
  // console.log(`studieasdcasdcn: ${studie}`);
  // console.log(`studiendescription: ${studie.description}`)
  // const studiendata = { studie }
  // console.log(`studien: ${studiendata}`)

  return (
    <div className="w-full flex flex-col items-center justify-center" style={{ height: 'calc(100vh - 89px)' }}>

        <div className="text-4xl font-bold justify-center pb-8">
          {studie.titel}
        </div>
        {/* {studie.description_control}
        {studie.description_treatment}
        {group === 'treatment' ? 
        studie.description_treatment 
        : 
        studie.description_control} */}

        <Carousel className="">
          <CarouselContent className=" h-[70vh] aspect-square">
            <CarouselItem className="border-2  h-full rounded-3xl">
              <div className="p-1">

              </div>
            {group === 'treatment' ? 
            studie.description_treatment 
            : 
            studie.description_control}
            </CarouselItem>
            <CarouselItem className="border-2 h-full rounded-3xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {group === 'treatment' ? 
                studie.description_treatment 
                : 
                studie.description_control}
              </ReactMarkdown>
            </CarouselItem>
            <CarouselItem className="border-2 h-full w-1/2 rounded-3xl flex flex-col items-center justify-center">
              <Link 
                href={`/tasks?PROLIFIC_PID=${PROLIFIC_PID}&STUDY_ID=${STUDY_ID}&SESSION_ID=${SESSION_ID}&study=${study}&index=0&group=${group}`} 
                className="cursor-pointer text-3xl font-bold p-5 py-4 border bg-[#B10034] hover:scale-110 transition duration-500 rounded-full text-white hover:text-[#B10034] hover:bg-white hover:border-spacing-6 border-hidden border-neutral-300"
              >
                start the study
              </Link>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext>
            <div className="h-6 w-5 bg-black">-</div>
          </CarouselNext>
        </Carousel>

        {/* {data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-5 mb-10">
              <div className="text-4xl font-bold">{item.titel}</div>
              <div>
              {item.description}
                {group === 'treatment' ? item.description_treatment : item.description_control}
              </div>
            </div>
          ))
        ) : (
          <p>No instructions found.</p>
        )} */}
     
    </div>
  );
}

export default Home;
