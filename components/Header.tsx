"use client"

import { fetchStudyInstruction } from "@/app/actions";
import Image from "next/image";


// import { useSearchParams } from "next/navigation";
// import HeaderFetch from "./Header_fetch";

const Header =  () => {

    // const searchParams = useSearchParams(); // Get the search parameters

    // // Extract the necessary search params from URL
    // const study = searchParams.get("study"); // Default value if not found
    // const group = searchParams.get("group"); // Default to 'treatment'
    // const PROLIFIC_PID = searchParams.get("PROLIFIC_PID");
    // const STUDY_ID = searchParams.get("STUDY_ID") || "";
    // const SESSION_ID = searchParams.get("SESSION_ID");


    return ( 
        <div className="w-full p-4 flex flex-row items-center border-b border-neutral-100">
            {/* <div className="relative w-32 h-14">
                <Image
                src="/logo_FIM.svg"  // Ensure the file extension is correct
                alt="Logo Description"  // Always include an alt attribute for accessibility
                layout="fill"  // Makes the image fill the container
                objectFit="cover"  // Ensures the image covers the area without distorting aspect ratio
            />   
            </div> */}
            {/* <div className="px-5 text-3xl">
                BA- 
            </div> */}
            <div className="flex-grow">

            </div>
            <div>
                {/* <HeaderWrapper /> */}
                {/* <HeaderFetch
                    study={study}
                    group={group}
                    PROLIFIC_PID={PROLIFIC_PID}
                    STUDY_ID={STUDY_ID}
                    SESSION_ID={SESSION_ID}
                    /> */}
            </div>
        </div>
     );
}
 
export default Header;