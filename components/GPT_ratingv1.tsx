'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FaArrowUp } from "react-icons/fa6";
import { GoSearch } from "react-icons/go";
import { generateGrade, generatePromtReplacement, generateRating, generateSuggestions } from '../app/actions';
import { useChat } from 'ai/react';
import { CgDanger } from "react-icons/cg";
import BounceLoader from "react-spinners/BounceLoader";
import PropagateLoader from "react-spinners/PropagateLoader";


interface GPT_ratingv1Props {
    group: string | undefined;
}

const GPT_ratingv1: React.FC<GPT_ratingv1Props> = ({ group }) => {

    // const { messages, input, handleInputChange, handleSubmit, data } = useChat();
    const [input, setInput] = useState('');
    const [isInputNotEmpty, setIsInputNotEmpty] = useState(false);
    const [debouncedInput, setDebouncedInput] = useState('');
    const [loadingPromt, setLoadingPromt] = useState(false);
    const [loadingPromtNewGrade, setLoadingPromtNewGrade] = useState(false);
    const [loadingGradeinput, setLoadingGradeinput] = useState(false);
    // const [loadingNudeges, setLoadingPromt] = useState(false);
    // const [loadingPromt, setLoadingPromt] = useState(false);

    const [ratingResult, setRatingResult] = useState({
        grade: 0,
        categories: {},
        promtReplacement: ""
    });
    const [grade, setGrade] = useState<string>("");
    const [gradeNewPromt, setGradeNewPromt] = useState<string>("");
    const [promtReplacement, setPromtReplacement] = useState<string | undefined>("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    // evaluate whether unique suggestions is the better way do do that 
    // or call them Nudges

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // if group is treatment then retain all functionalities, else only input field with enter button

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedInput(input);
        }, 900);

        return () => {
            clearTimeout(handler);
        };
    }, [input]);

    // Generate grade
    useEffect(() => {
        if (group === 'treatment' && debouncedInput && debouncedInput.split(' ').filter(word => word.length > 0).length > 4) {
            (async () => {
                setLoadingGradeinput(true)
                try {
                    const gradeResponse = await generateGrade(debouncedInput);
                    const gradeValue = gradeResponse?.grade ?? 0; // Extract the grade value
                    setGrade(String(gradeValue)); // Ensure grade is a string
                    console.log('Grade:', gradeValue);
                } catch (error) {
                    console.error('Error generating grade:', error);
                } finally {
                    setLoadingGradeinput(false)
                }
            })();
        }
    }, [debouncedInput]);

    // Generate prompt replacement
    useEffect(() => {
        if (group === 'treatment' && debouncedInput && debouncedInput.split(' ').filter(word => word.length > 0).length > 4) {
            (async () => {
                setLoadingPromt(true); // Start loading
                try {
                    const promtReplacementResponse = await generatePromtReplacement(debouncedInput);
                    const promtReplacementValue = promtReplacementResponse?.promtReplacement ?? ''; // Extract the promtReplacement property
                    setPromtReplacement(promtReplacementValue); // Set the extracted value
                    
                    // const gradeNewPromtResponse = await generateGrade(promtReplacement);
                    // const gradeNewPromtValue = gradeNewPromtResponse?.grade ?? 0; // Extract the grade value
                    // setGradeNewPromt(String(gradeNewPromtValue)); // Ensure grade is a string
                    // console.log('Grade:', gradeNewPromtValue);

                    
                    console.log('newPromtreplacement:', promtReplacementResponse);
                } catch (error) {
                    console.error('Error generating prompt replacement:', error);
                } finally {
                    setLoadingPromt(false); // End loading
                }
            })();
        }
    }, [debouncedInput]);


    // Generate prompt replacement grade
    useEffect(() => {
        if (group === 'treatment' && debouncedInput && debouncedInput.split(' ').filter(word => word.length > 0).length > 4) {
            (async () => {
                setLoadingPromtNewGrade(true); // Start loading
                try {
                    
                    const gradeNewPromtResponse = await generateGrade(promtReplacement || '');
                    const gradeNewPromtValue = gradeNewPromtResponse?.grade ?? 0; // Extract the grade value
                    setGradeNewPromt(String(gradeNewPromtValue)); // Ensure grade is a string
                    console.log('Gradeof new promt:', gradeNewPromtValue);

                    
                    console.log('newPromtreplacementGrade:', gradeNewPromt);
                } catch (error) {
                    console.error('Error generating prompt replacement:', error);
                } finally {
                    setLoadingPromtNewGrade(false); // End loading
                }
            })();
        }
    }, [promtReplacement]);


    // Generate suggestions/nudges
    useEffect(() => {
        if (group === 'treatment' && debouncedInput) {
            (async () => {
                try {
                    const suggestionsResponse = await generateSuggestions(debouncedInput);
                    setSuggestions(suggestionsResponse); // Set the extracted value
                    console.log('newSuggestions:', suggestionsResponse);
                } catch (error) {
                    console.error('Error generating suggestions:', error);
                }
            })();
        }
    }, [debouncedInput]);


    useEffect(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                handlePromtReplacementClick();
            }
        };

        window.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, [promtReplacement]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInput(value);
        setIsInputNotEmpty(value.trim().length > 0);
        autoResizeTextarea();
    
        if (value.length === 0) {  // Use 'value' instead of 'input' to check the length
            setGrade("");
            setPromtReplacement("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            setDebouncedInput(input);
        }

        // oder wenn enter dann
        // handleSubmit(e
    };

    const handlePromtReplacementClick = () => {
        setInput(promtReplacement || '');
        setIsInputNotEmpty((promtReplacement || '').trim().length > 0);
        setPromtReplacement(""); 
        autoResizeTextarea();
    };

    const autoResizeTextarea = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const getGradeColor = (grade: number): string => {
        const startColor: [number, number, number] = [220, 53, 69]; // Red
        const endColor: [number, number, number] = [40, 167, 69];   // Green
    
        const interpolateColor = (start: number, end: number, factor: number): number => {
            return start + factor * (end - start);
        };
    
        const color = startColor.map((start, index) => {
            return Math.round(interpolateColor(start, endColor[index], grade / 10)).toString(16).padStart(2, '0');
        }).join('');
    
        return `#${color}`;
    };
    

    return (
        <div className="flex flex-col w-full h-full relative">
            <div
                className={`flex ${isInputNotEmpty ? 'items-start flex-col ' : 'items-center flex-row'} absolute bottom-0 w-full bg-neutral-100 rounded-3xl transition-all duration-300  ${
                    isInputNotEmpty ? '' : 'h-16'
                }`}
            >
                {isInputNotEmpty && (
                    <div className="w-full overflow-scroll">
                        <div className="rounded text-left">
                            <div className="flex flex-row gap-5 items-start">
                                <div className="flex flex-col gap-3 w-full">
                                    <div className='flex flex-row items-center gap-4'>
                                        {/* <div
                                            className="text-lg font-semibold border-2 rounded-full w-8 h-8 min-w-8 flex items-center justify-center min-w"
                                            style={{
                                                color: getGradeColor(ratingResult.grade),
                                                borderColor: getGradeColor(ratingResult.grade)
                                            }}
                                        >
                                            {grade}
                                        </div> */}
                                        
                                        {/* {ratingResult.categories && ratingResult.categories.length > 0 && (
                                            <div className='flex flex-row gap-3'>
                                                {ratingResult.categories.map((category, index) => (
                                                    <div key={index} className='border-2 rounded-lg border-orange-400 p-1'>
                                                        {Object.entries(category).map(([key, value]) => (
                                                            <div key={key}>
                                                                <div>{value}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        )} */}
                                    </div>
                                    {/* {ratingResult.promtReplacement && (
                                        <div className='bg-black  text-white font-medium p-1 px-2'>{ratingResult.promtReplacement}</div>
                                    )} */}
                                    <div className={isInputNotEmpty && promtReplacement ? `min-h-6` : `h-0`}>
                                        <div className='flex flex-row items-center'>
                                            <div className='text-neutral-300 h-6 px-6 mr-2 flex flex-col items-center justify-center'>
                                                <CgDanger size={22} />
                                            </div>
                                            <div className='flex flex-row gap-4 mr-36'>
                                                <div className='text-sm border-2 border-cyan-400 text-cyan-400 font-semibold rounded-xl px-2 p-1'>Example suggesion</div>
                                                <div className='text-sm border-2 border-violet-400 text-violet-400 font-semibold rounded-xl px-2 p-1'>Example suggesion</div>
                                            </div>
                                        </div>
                                    </div>
                                   
                                    {(loadingPromt || promtReplacement) && (
                                        <div className='bg-neutral-200 cursor-pointer w-full mb-2 flex flex-row gap-5 p-2' onClick={!loadingPromt && promtReplacement ? handlePromtReplacementClick : undefined}>
                                            <div className='flex flex-col '>
                                                <div className='flex-grow'></div>
                                                <div className='rounded-full m-2 h-8 w-8 flex flex-col items-center justify-center'>
                                                {loadingPromtNewGrade || loadingPromt ? (
                                                    <BounceLoader color="#000000" loading={loadingPromtNewGrade || loadingPromt} size={30} />
                                                ) : (
                                                    <div
                                                    className="text-lg font-semibold rounded-full w-8 h-8 min-w-8 flex items-center justify-center"
                                                    style={{
                                                        backgroundColor: getGradeColor(Number(grade)),
                                                        color: '#FFFFFF' // Always set text color to white
                                                    }}
                                                >
                                                    
                                                        {gradeNewPromt}
                                                    </div>
                                                )}

                                                </div>
                                            </div>
                                            <div className={`flex-grow max-h-[150px] overflow-y-auto ${loadingPromt ? 'flex flex-col items-center justify-center' : ''}`}>
                                                {loadingPromt ? <PropagateLoader color="#000000" loading={loadingPromt} size={10} /> : promtReplacement}
                                            </div>

                                            {(loadingPromt || promtReplacement) && (
                                                <div className='flex flex-col items-center justify-center gap-3 text-xs text-neutral-400'>
                                                    <div>str + K</div>
                                                    <div> ⌘ + K</div>                                             
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className='flex-grow'></div>
                <div className={`flex flex-row w-full items-end pl-4 ${isInputNotEmpty ? 'mb-2' : ''}`}>
                    <div className={isInputNotEmpty ? `mb-2` : `text-neutral-400 mb-3`}>
                    {grade && input ? (
                        <div
                            className="text-lg font-semibold rounded-full w-8 h-8 min-w-8 flex items-center justify-center"
                            style={{
                                backgroundColor: getGradeColor(Number(grade)),
                                color: '#FFFFFF' // Always set text color to white
                            }}
                        >
                            {grade}
                        </div>
                    ) : loadingGradeinput ? (
                        <BounceLoader color="#000000" loading={loadingGradeinput} size={30} />
                    ) : (
                        <GoSearch size={20} />
                    )}

                    </div>

                    <textarea
                        ref={textareaRef}
                        className="flex-1 border-none bg-transparent outline-none pl-6 resize-none overflow-hidden z-20"
                        value={input}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Send a message to Chat-GPT..."
                        rows={1}
                        style={{ minHeight: '38px', maxHeight: '150px', overflowY: 'auto' }}
                    />
                    <Button
                        className={`h-[40px] w-[40px] relative ${isInputNotEmpty ? `border-none bg-black` : ` border-2 border-neutral-200 bg-white text-neutral-300`} rounded-3xl mr-2 `}
                        onClick={() => setDebouncedInput(input)}
                        disabled={input.trim() === ""}
                        // onClick={handleSubmit}
                    >
                        <div className='absolute'>
                            <FaArrowUp size={15} />
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GPT_ratingv1;
