'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FaArrowUp } from "react-icons/fa6";
import { GoPerson, GoSearch } from "react-icons/go";
import { GiStarShuriken } from "react-icons/gi";
import { generateGrade, generatePromtReplacement, generateRating, generateSug, generateSuggestions } from '../app/actions';
import { useChat } from 'ai/react';
import { CgDanger } from "react-icons/cg";
import BounceLoader from "react-spinners/BounceLoader";
import PropagateLoader from "react-spinners/PropagateLoader";
import PuffLoader from "react-spinners/PuffLoader";


interface GPT_ratingv1Props {
    group: string | undefined;
}

const GPT_ratingv1: React.FC<GPT_ratingv1Props> = ({ group }) => {

    const { messages, input: chatInput, handleInputChange, handleSubmit, data } = useChat();
    const [input, setInput] = useState('');
    const [isInputNotEmpty, setIsInputNotEmpty] = useState(false);
    const [debouncedInput, setDebouncedInput] = useState('');
    // const [messages, setMessages] = useState<string[]>([])

    const [loadingPromt, setLoadingPromt] = useState(false);
    const [loadingPromtNewGrade, setLoadingPromtNewGrade] = useState(false);
    const [loadingGradeinput, setLoadingGradeinput] = useState(false);
    const [loadingSuggestion, setLloadingSuggestion] = useState(false);

    
    const [grade, setGrade] = useState<string>("");
    const [gradeNewPromt, setGradeNewPromt] = useState<string>("");
    const [promtReplacement, setPromtReplacement] = useState<string | undefined>("");
    const [suggestion, setSuggestion] = useState<string | undefined>("");
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


    useEffect(() => {
        // Sync local input with useChat's input on mount
        setInput(chatInput);
      }, [chatInput]);
    
      const handleLocalInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInput(value); // Update local input
        handleInputChange(e); // Sync with useChat's input
      };





    // Generate grade
    useEffect(() => {
        if (group === 'treatment' && debouncedInput && debouncedInput.split(' ').filter(word => word.length > 0).length > 3) {
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
        if (group === 'treatment' && debouncedInput && debouncedInput.split(' ').filter(word => word.length > 0).length > 3) {
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
        if (group === 'treatment' && debouncedInput && debouncedInput.split(' ').filter(word => word.length > 0).length > 3) {
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
        if (group === 'treatment' && debouncedInput && debouncedInput.split(' ').filter(word => word.length > 0).length > 3) {
            (async () => {
                setLloadingSuggestion(true)
                try {
                    const suggestionsResponse = await generateSuggestions(debouncedInput || '');
                    const suggestionsResponseValue = suggestionsResponse?.suggestions ?? '';
                    setSuggestion(suggestionsResponseValue); // Set the extracted value
                    console.log('newSuggestions:', suggestionsResponseValue);
                } catch (error) {
                    console.error('Error generating suggestions:', error);
                } finally {
                    setLloadingSuggestion(false)
                }
            })();
        }
    }, [debouncedInput]);


    useEffect(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            // Check for Ctrl+K or Cmd+K to trigger handlePromtReplacementClick
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                handlePromtReplacementClick();
            }
    
            // Check for Enter key to trigger promtSubmit
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSubmit(event as any); 
                setIsInputNotEmpty(false);
            }
        };
    
        window.addEventListener('keydown', handleKeydown);
    
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, [promtReplacement, input]);

    const prehandleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInput(value);
        // setGrade("");
        setIsInputNotEmpty(value.trim().length > 0);
        autoResizeTextarea();
    
        if (value.length === 0) {  // Use 'value' instead of 'input' to check the length
            setGrade("");
            setPromtReplacement("")
            setSuggestion("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            setDebouncedInput(input);
        }

        // oder wenn enter dann
        // handleSubmit()
    };

    const handlePromtReplacementClick = () => {
        setInput(promtReplacement || '');
        setIsInputNotEmpty((promtReplacement || '').trim().length > 0);
        setPromtReplacement(""); 
        autoResizeTextarea();
    };

    const combinedHandleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        prehandleInputChange(e); // Call your prehandleInputChange function
        handleInputChange(e);    // Call the original handleInputChange function
    };

    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setDebouncedInput(input); // First action you want to perform
        handleSubmit(event as any); // Call handleSubmit after
    };


    // const handlePromtSubmit = () => {

    //     setMessages((prevMessages) => [...prevMessages, input]);

    //     const response = generateSug(input)

    //     setMessages((prevMessages) => [...prevMessages, response]);
    //     setInput('');
    //     // setIsInputNotEmpty((promtReplacement || '').trim().length > 0);
    //     setPromtReplacement(""); 
    //     // autoResizeTextarea();
       


    //     // call action to generate a message in the role of ai
    // };

    const autoResizeTextarea = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const getGradeColor = (grade: number): string => {
        const gradeColors: { [key: number]: string } = {
            5: "49ad07", 
            4:  "a5ad07",
            3:  "ad9a07",
            2:  "ad2507",
            1:  "820903",
            0:  "000000"
        };
    
        return `#${gradeColors[grade] || "000000"}`; // Default to black if grade is not in the range
    };
    
    

    return (
        <div className="flex flex-col w-full h-full relative">

            <div className="flex flex-col space-y-4 overflow-scroll p-2 mb-16">
                {messages
                    .filter((message) => message.role !== "system")
                    .map((message, index) => (
                        <div
                            key={index}
                            className={`p-2 rounded ${message.role === "user" ? "text-right" : "text-left"}`}
                        >
                            <div className="flex flex-row gap-5 items-start">
                                <div className="flex-shrink-0">
                                    {message.role === "user" ? 
                                        <GoPerson size={25} /> :
                                        <GiStarShuriken color='#21d9c3' size={25} />
                                    }
                                </div>
                                <div className="flex-1 whitespace-pre-wrap">

                                    test m
                                    {message.content}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
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
                                    </div>
                                   
                                    <div className={suggestion || loadingSuggestion ? `min-h-6` : `h-0`}>
                                        <div className='flex flex-row items-center'>
                                            <div className='text-neutral-300 h-6 px-4 mr-2 flex flex-col items-center justify-center'>
                                                {loadingSuggestion ? <PuffLoader  color="#000000" loading={loadingPromtNewGrade || loadingPromt} size={30} /> : <CgDanger size={22} className='ml-1' />}
                                            </div>
                                            <div className='flex flex-row gap-4 mr-36'>
                                                <div className='text-sm border-2 border-cyan-400 text-cyan-400 font-semibold rounded-xl px-2 p-1'>{suggestion}</div>
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
                                                        backgroundColor: getGradeColor(Number(gradeNewPromt)),
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
                                                <div className='flex flex-col items-center justify-center gap-3 text-xs text-neutral-400 min-w-10'>
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
                        onChange={combinedHandleChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Send a message to Chat-GPT..."
                        rows={1}
                        style={{ minHeight: '38px', maxHeight: '150px', overflowY: 'auto' }}
                    />
                    <Button
                        className={`h-[40px] w-[40px] relative ${isInputNotEmpty ? `border-none bg-black` : ` border-2 border-neutral-200 bg-white text-neutral-300`} rounded-3xl mr-2 `}
                        onClick={handleButtonClick}
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
