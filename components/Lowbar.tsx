import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FaArrowUp } from "react-icons/fa6";

const Lowbar = () => {
    return ( 
        <div className="w-full h-32 border-t border-neutral-200 absolute bottom-0 left-0 flex items-center justify-center">
            <div className=" p-2 relative md: w-1/2">
                <Input className="h-12" placeholder="tipe..."/>
                <Button className="absolute right-3 top-3 w-10 p-1">
                    <FaArrowUp size={15} />
                </Button>
            </div>
        </div>
     );
}
 
export default Lowbar;