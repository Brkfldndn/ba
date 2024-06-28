import Image from "next/image";

const Header = () => {
    return ( 
        <div className="w-full p-4 flex flex-row items-center border-b border-neutral-100">
            <div className="relative w-32 h-14">
                <Image
                src="/logo_FIM.svg"  // Ensure the file extension is correct
                alt="Logo Description"  // Always include an alt attribute for accessibility
                layout="fill"  // Makes the image fill the container
                objectFit="cover"  // Ensures the image covers the area without distorting aspect ratio
            />   
            </div>
            {/* <div className="px-5 text-3xl">
                BA- 
            </div> */}
            <div className="flex-grow">

            </div>
            <div>
                Prolific ID
            </div>
        </div>
     );
}
 
export default Header;