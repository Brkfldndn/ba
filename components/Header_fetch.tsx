// import { fetchStudyInstruction } from "@/app/actions";

// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
//     AlertDialogTrigger,
//   } from "@/components/ui/alert-dialog"
// import { Button } from "@/components/ui/button"

// import {
//     Carousel,
//     CarouselContent,
//     CarouselItem,
//     CarouselNext,
//     CarouselPrevious,
// } from "@/components/ui/carousel";

// const HeaderFetch = async ({
//     study,
//     group,
//     PROLIFIC_PID,
//     STUDY_ID,
//     SESSION_ID,
//   }: {
//     study: string;
//     group: string | null;
//     PROLIFIC_PID: string | null;
//     STUDY_ID: string;
//     SESSION_ID: string | null;
//   }) => {

//     const studie = await fetchStudyInstruction(study);
  
//     console.log(`als string:${studie}`)
  
//     // Determine which instruction to use based on the group
//     const instruction = group === 'treatment' 
//       ? studie.description_treatment 
//       : studie.description_control;
  
//     // Split the instruction into parts using $$$ as the delimiter
//     const parts = instruction.split('$$$');
  
//     console.log(`als parts:${parts}`)

//     return ( 
//         <div>
//             {/* <AlertDialog>
//                 <AlertDialogTrigger asChild>
//                     <Button variant="outline">Show Dialog</Button>
//                 </AlertDialogTrigger>
//                 <AlertDialogContent>
//                 <Carousel className="">
//                         <CarouselContent className=" h-[60vh] aspect-square">
//                     {parts.map((part: string, index: number) => (
//                         <CarouselItem key={index}>
//                         <div className="border-2 w-[58vh] h-full overflow-scroll rounded-3xl p-8 prose">
//                             <MDXRemote source={part} />
//                         </div>
//                         </CarouselItem>
//                     ))}
//                     <CarouselItem className="">
//                         <div className="border-2 w-[58vh] h-full overflow-scroll rounded-3xl p-8 flex flex-col items-center justify-center">
//                         <Link 
//                             href={`/tasks?PROLIFIC_PID=${PROLIFIC_PID}&STUDY_ID=${STUDY_ID}&SESSION_ID=${SESSION_ID}&study=${study}&index=0&group=${group}`} 
//                             className="cursor-pointer text-3xl font-bold p-5 py-4 border bg-[#B10034] hover:scale-110 transition duration-500 rounded-full text-white hover:text-[#B10034] hover:bg-white hover:border-spacing-6 border-hidden border-neutral-300"
//                         >
//                             start the study
//                         </Link>
//                         </div>
//                     </CarouselItem>
//                     </CarouselContent>
//                     <CarouselPrevious />
//                     <CarouselNext>
//                     <div className="h-6 w-5 bg-black">-</div>
//                     </CarouselNext>
//                 </Carousel>
//                 </AlertDialogContent>
//             </AlertDialog> */}
//         </div>
//      );
// }
 
// export default HeaderFetch;