'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FaArrowUp } from "react-icons/fa6";
import { GoPerson, GoSearch } from "react-icons/go";
import { GiStarShuriken } from "react-icons/gi";
import { generateGrade, generatePromtReplacement, generateRating, generateSug, generateSuggestion2, generateSuggestion3, generateSuggestions } from '../app/actions';
import { useChat } from 'ai/react';
import { CgDanger } from "react-icons/cg";
import BounceLoader from "react-spinners/BounceLoader";
import PropagateLoader from "react-spinners/PropagateLoader";
import PuffLoader from "react-spinners/PuffLoader";
import useFormStore from '@/app/tasks/store/useFormStore';
import { useSearchParam } from 'react-use';
import { useSearchParams } from 'next/navigation';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
  } from "@/components/ui/hover-card"
import { FiCopy } from "react-icons/fi";
import { toast } from './ui/use-toast';


interface GPT_ratingv1Props {
    group: string | undefined;
}

const GPT_ratingv1: React.FC<GPT_ratingv1Props> = ({ group }) => {

    const { messages, input: chatInput, handleInputChange, handleSubmit } = useChat({
        onFinish: (message) => {
            pushtoFormStore(message);
        }
    });
    
    
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
    const [suggestion2, setSuggestion2] = useState<string | undefined>("");
    const [suggestion3, setSuggestion3] = useState<string | undefined>("");
    // evaluate whether unique suggestions is the better way do do that 
    // or call them Nudges

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const searchParam = useSearchParams()
    const index = searchParam.get("index")
    // const { updateFormData } = useFormStore();
    const { formData, updateFormData } = useFormStore(); // Access formData from the store

    const [hoveredMessage, setHoveredMessage] = useState(null);

    const copyToClipboard = (text:string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Response saved",
            description: "You can still edit it in the answer section",
        });

        const taskIndex = index ? parseInt(index, 10) : 0;
        // Create the object that matches the FormData structure
        const formDataUpdate = {
            answer: text // Assuming 'answer' is the correct key in your FormData
        };

        // Update the form store directly
        useFormStore.getState().updateFormData(taskIndex, formDataUpdate);
    };

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



    //only interst the text here for now

    useEffect(() => {
        if (group === 'treatment' && debouncedInput && debouncedInput.split(' ').filter(word => word.length > 0).length > 3) {
            // Get the current task index from search parameters
            const taskIndex = index ? parseInt(index, 10) : 0;


            // Access the form store
            const formData = useFormStore.getState().formData;
    
            // Capture the current data for the task index
            let currentData = formData[taskIndex]?.response_data || [];
            if (!Array.isArray(currentData)) {
                currentData = []; // Ensure it's always an array
            }
    
            // Update the unfinished_prompt with only the debouncedInput text
            const updatedResponseData = [
                ...currentData,  // Spread the existing data
                {
                    unfinished_prompt: {
                        text: debouncedInput, // Use debouncedInput as the text for unfinished_prompt
                        prompt_replacement: {
                            replacement_text: "", // Placeholder for now
                            grade: 0, // Placeholder for now
                        },
                        grade: 0, // Placeholder for now
                        suggestions: [], // Placeholder for now
                    },
                },
            ];
    
            // Update the form store with the new data
            updateFormData(taskIndex, {
                ...formData[taskIndex],
                response_data: updatedResponseData,
            });
    
            console.log("Updated formData with new unfinished_prompt:", useFormStore.getState().formData);
        }
    }, [debouncedInput]);
    








    


    // Generate grade and insert it into formStore
    useEffect(() => {
        if (group === 'treatment' && debouncedInput && debouncedInput.split(' ').filter(word => word.length > 0).length > 3) {
            (async () => {
                setLoadingGradeinput(true);
                try {
                    const gradeResponse = await generateGrade(debouncedInput);
                    const gradeValue = gradeResponse?.grade ?? 0; // Extract the grade value
                    setGrade(String(gradeValue)); // Ensure grade is a string
                    console.log('Generated Grade:', gradeValue);
    
                    // Get the current task index from search parameters
                    const taskIndex = index ? parseInt(index, 10) : 0;
    
                    // Access the form store
                    const formData = useFormStore.getState().formData;
    
                    // Capture the current data for the task index
                    let currentData = formData[taskIndex]?.response_data || [];
                    if (!Array.isArray(currentData)) {
                        currentData = []; // Ensure it's always an array
                    }
    
                    // Map through the current data and update only the matching unfinished_prompt
                    const updatedResponseData = currentData.map((item, idx) => {
                        if (item.unfinished_prompt && idx === currentData.length - 1) {
                            return {
                                ...item,
                                unfinished_prompt: {
                                    ...item.unfinished_prompt,
                                    grade: gradeValue, // Update grade here
                                },
                            };
                        }
                        return item; // Preserve the rest of the entries as they are
                    });
    
                    // Update the form store with the new data
                    updateFormData(taskIndex, {
                        ...formData[taskIndex],
                        response_data: updatedResponseData,
                    });
    
                    console.log("Updated formData with latest grade:", useFormStore.getState().formData);
                } catch (error) {
                    console.error('Error generating grade:', error);
                } finally {
                    setLoadingGradeinput(false);
                }
            })();
        }
    }, [debouncedInput]);
    
    
    
    
    
    
    
    
    

    // Generate prompt replacement and add it to formStore
    useEffect(() => {
        if (group === 'treatment' && debouncedInput && debouncedInput.split(' ').filter(word => word.length > 0).length > 3) {
            (async () => {
                setLoadingPromt(true); // Start loading
                try {
                    const promtReplacementResponse = await generatePromtReplacement(debouncedInput);
                    const promtReplacementValue = promtReplacementResponse?.promtReplacement ?? ''; // Extract the promptReplacement property
                    setPromtReplacement(promtReplacementValue); // Set the extracted value
                    
                    console.log('newPromtreplacement:', promtReplacementResponse);
    
                    // Get the current task index from search parameters
                    const taskIndex = index ? parseInt(index, 10) : 0;
    
                    // Access the form store
                    const formData = useFormStore.getState().formData;
    
                    // Capture the current data for the task index
                    let currentData = formData[taskIndex]?.response_data || [];
                    if (!Array.isArray(currentData)) {
                        currentData = []; // Ensure it's always an array
                    }
    
                    // Update the latest unfinished_prompt with the new prompt replacement
                    const updatedResponseData = currentData.map((item, idx) => {
                        if (item.unfinished_prompt && idx === currentData.length - 1) {
                            return {
                                ...item,
                                unfinished_prompt: {
                                    ...item.unfinished_prompt,
                                    prompt_replacement: {
                                        ...item.unfinished_prompt.prompt_replacement,
                                        replacement_text: promtReplacementValue, // Update replacement_text here
                                    },
                                },
                            };
                        }
                        return item; // Preserve the rest of the entries as they are
                    });
    
                    // Update the form store with the new data
                    updateFormData(taskIndex, {
                        ...formData[taskIndex],
                        response_data: updatedResponseData,
                    });
    
                    console.log("Updated formData with new prompt replacement:", useFormStore.getState().formData);
    
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
        if (group === 'treatment' && promtReplacement && promtReplacement.split(' ').filter(word => word.length > 0).length > 3) {
            (async () => {
                setLoadingPromtNewGrade(true); // Start loading
                try {
                    // Generate grade for the prompt replacement
                    const gradeNewPromtResponse = await generateGrade(promtReplacement || '');
                    const gradeNewPromtValue = gradeNewPromtResponse?.grade ?? 0; // Extract the grade value
                    setGradeNewPromt(String(gradeNewPromtValue)); // Ensure grade is a string
                    console.log('Grade of new prompt:', gradeNewPromtValue);

                    // Get the current task index from search parameters
                    const taskIndex = index ? parseInt(index, 10) : 0;

                    // Access the form store
                    const formData = useFormStore.getState().formData;

                    // Capture the current data for the task index
                    let currentData = formData[taskIndex]?.response_data || [];
                    console.log('Current Data:', currentData);

                    // Find the latest unfinished_prompt and update the grade for prompt_replacement
                    const updatedResponseData = currentData.map((item, idx) => {
                        if (item.unfinished_prompt && idx === currentData.length - 1) {
                            // Update the prompt replacement grade
                            return {
                                ...item,
                                unfinished_prompt: {
                                    ...item.unfinished_prompt,
                                    prompt_replacement: {
                                        ...item.unfinished_prompt.prompt_replacement,
                                        grade: gradeNewPromtValue, // Update the prompt replacement grade
                                    },
                                },
                            };
                        }
                        return item;
                    });

                    // Update the form store with the new data
                    updateFormData(taskIndex, {
                        ...formData[taskIndex],
                        response_data: updatedResponseData,
                    });

                    console.log("Updated formData with new prompt replacement grade:", useFormStore.getState().formData);

                } catch (error) {
                    console.error('Error generating prompt replacement grade:', error);
                } finally {
                    setLoadingPromtNewGrade(false); // End loading
                }
            })();
        }
    }, [promtReplacement]);






    // Generate suggestion
    useEffect(() => {
        if (group === 'treatment' && debouncedInput && debouncedInput.split(' ').filter(word => word.length > 0).length > 3) {
            (async () => {
                setLloadingSuggestion(true);
                try {
                    const suggestionsResponse = await generateSuggestions(debouncedInput || '');
                    const suggestionsResponseValue = suggestionsResponse?.suggestions ?? '';
                    setSuggestion(suggestionsResponseValue); // Set the extracted value
                    console.log('newSuggestions:', suggestionsResponseValue);

                    // Get the current task index from search parameters
                    const taskIndex = index ? parseInt(index, 10) : 0;

                    // Access the form store
                    const formData = useFormStore.getState().formData;

                    // Capture the current data for the task index
                    let currentData = formData[taskIndex]?.response_data || [];
                    console.log('Current Data:', currentData);

                    // Find the latest unfinished_prompt and append the suggestion
                    const updatedResponseData = currentData.map((item, idx) => {
                        if (item.unfinished_prompt && idx === currentData.length - 1) {
                            // Append the suggestion to the suggestions array
                            return {
                                ...item,
                                unfinished_prompt: {
                                    ...item.unfinished_prompt,
                                    suggestions: [...(item.unfinished_prompt.suggestions || []), suggestionsResponseValue], // Append the suggestion
                                },
                            };
                        }
                        return item;
                    });

                    // Update the form store with the new data
                    updateFormData(taskIndex, {
                        ...formData[taskIndex],
                        response_data: updatedResponseData,
                    });

                    console.log("Updated formData with new suggestions:", useFormStore.getState().formData);

                } catch (error) {
                    console.error('Error generating suggestions:', error);
                } finally {
                    setLloadingSuggestion(false);
                }
            })();
        }
    }, [debouncedInput]);



    



    // Generate suggestion2
    useEffect(() => {
        if (group === 'treatment' && debouncedInput && debouncedInput.split(' ').filter(word => word.length > 0).length > 3) {
            (async () => {
                setLloadingSuggestion(true);
                try {
                    const suggestion2Response = await generateSuggestion2(debouncedInput || '');
                    const suggestion2ResponseValue = suggestion2Response?.suggestion2 ?? '';
                    setSuggestion2(suggestion2ResponseValue); // Set the extracted value
                    console.log('newSuggestions2:', suggestion2ResponseValue);

                    // Get the current task index from search parameters
                    const taskIndex = index ? parseInt(index, 10) : 0;

                    // Access the form store
                    const formData = useFormStore.getState().formData;

                    // Capture the current data for the task index
                    let currentData = formData[taskIndex]?.response_data || [];
                    console.log('Current Data:', currentData);

                    // Find the latest unfinished_prompt and append the suggestion2
                    const updatedResponseData = currentData.map((item, idx) => {
                        if (item.unfinished_prompt && idx === currentData.length - 1) {
                            // Append the suggestion2 to the suggestions array
                            return {
                                ...item,
                                unfinished_prompt: {
                                    ...item.unfinished_prompt,
                                    suggestions: [...(item.unfinished_prompt.suggestions || []), suggestion2ResponseValue], // Append the suggestion2
                                },
                            };
                        }
                        return item;
                    });

                    // Update the form store with the new data
                    updateFormData(taskIndex, {
                        ...formData[taskIndex],
                        response_data: updatedResponseData,
                    });

                    console.log("Updated formData with new suggestion2:", useFormStore.getState().formData);

                } catch (error) {
                    console.error('Error generating suggestion2:', error);
                } finally {
                    setLloadingSuggestion(false);
                }
            })();
        }
    }, [debouncedInput]);   



    // Generate suggestion3
    useEffect(() => {
        if (group === 'treatment' && debouncedInput && debouncedInput.split(' ').filter(word => word.length > 0).length > 3) {
            (async () => {
                setLloadingSuggestion(true);
                try {
                    const suggestion3Response = await generateSuggestion3(debouncedInput || '');
                    const suggestion3ResponseValue = suggestion3Response?.suggestion2 ?? '';
                    setSuggestion3(suggestion3ResponseValue); // Set the extracted value
                    console.log('newSuggestions3:', suggestion3ResponseValue);

                    // Get the current task index from search parameters
                    const taskIndex = index ? parseInt(index, 10) : 0;

                    // Access the form store
                    const formData = useFormStore.getState().formData;

                    // Capture the current data for the task index
                    let currentData = formData[taskIndex]?.response_data || [];
                    console.log('Current Data:', currentData);

                    // Find the latest unfinished_prompt and append the suggestion2
                    const updatedResponseData = currentData.map((item, idx) => {
                        if (item.unfinished_prompt && idx === currentData.length - 1) {
                            // Append the suggestion2 to the suggestions array
                            return {
                                ...item,
                                unfinished_prompt: {
                                    ...item.unfinished_prompt,
                                    suggestions: [...(item.unfinished_prompt.suggestions || []), suggestion3ResponseValue], // Append the suggestion2
                                },
                            };
                        }
                        return item;
                    });

                    // Update the form store with the new data
                    updateFormData(taskIndex, {
                        ...formData[taskIndex],
                        response_data: updatedResponseData,
                    });

                    console.log("Updated formData with new suggestion3:", useFormStore.getState().formData);

                } catch (error) {
                    console.error('Error generating suggestion3:', error);
                } finally {
                    setLloadingSuggestion(false);
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
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                // handleSubmit(event as any); 
                handleButtonClick(event as any);
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
            setSuggestion2("");
            setSuggestion3("");

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
        handleInputChange(e);
        // Call the original handleInputChange function
    };




    const pushtoFormStore = (message: any) => {

        console.log("letzte Response", message.content)
        console.log("pushFormStore")

        // Get the current task index from search parameters
        const taskIndex = index ? parseInt(index, 10) : 0;

        // Capture the user's input before submitting
        const userInput2 = input;
        console.log(`input ${userInput2}`);
        
        // Capture the current data for the task index
        let currentData = formData[taskIndex]?.response_data || [];
        if (!Array.isArray(currentData)) {
            currentData = []; // Ensure it's always an array
        }
        console.log(`current data before update:`, currentData);
    
        // Add the new prompt-response pair to the response_data array
        const updatedResponseData = [
            ...currentData,  // Spread the existing data
            {
                prompt: {
                    text: userInput2, // Correctly capture the user's input
                    response: message.content, // Correctly capture the AI's response
                },
            },
        ];
    
        console.log(`updatedResponseData with new entry:`, updatedResponseData);
    
        // Update the form store with the new data
        updateFormData(taskIndex, {
            ...formData[taskIndex],
            response_data: updatedResponseData,
        });
    
        console.log("Updated formData:", useFormStore.getState().formData);
    }



    const handleButtonClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        console.log("ist gelaufen");
        event.preventDefault();
        await handleSubmit(event as any); // Process the input 
        setIsInputNotEmpty(false);
        setGrade("0");
        setGradeNewPromt("0");
        setPromtReplacement("");
        setSuggestion("");
        setSuggestion2("");
        setSuggestion3("");
    };
    



    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


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
                        className={`relative py-2 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`relative max-w-xl ${message.role === "user" ? "bg-neutral-100" : "bg-white border border-neutral-100"}  rounded-xl `}>
                            <div className="flex flex-col">
                                <div className='flex gap-3 items-start p-4'>
                                    {message.role === "user" ? (
                                        <GoPerson size={25} className="self-start mt-1" />
                                    ) : (
                                        <GiStarShuriken size={25} className="self-start mt-1" color='#21d9c3' />
                                    )}
                                    <div className="flex-1 whitespace-pre-wrap">
                                        {message.content}
                                    </div>
                                </div>
                                {message.role !== "user" && (
                                <div className=" w-full border-t border-neutral-100 flex flex-col items-center justify-center">
                                    <div
                                        onClick={() => copyToClipboard(message.content)}
                                        className="text-sm  flex flex-row gap-4 item-center transition duration-100 hover:text-neutral-400 p-3 rounded-t-xl cursor-pointer "
                                    >
                                        <FiCopy size={20} />
                                        <div>Select response as answer</div>
                                    </div>
                                </div>
                            )}
                            </div>
                        </div>
                    </div>
                ))}





                <div ref={messagesEndRef} />
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
                                                {suggestion && suggestion !== '-' && (
                                                <div className='relative text-sm border-2 border-cyan-400 text-cyan-400 font-semibold rounded-xl px-2 p-1 pr-5'>
                                                    {suggestion}
                                                    <HoverCard>
                                                        <HoverCardTrigger asChild>
                                                            <div className='absolute h-5 w-5 border-0 right-0 bottom-0 bg-cyan-400 rounded-br-[10px] rounded-tl-[10px] text-neutral-100 flex flex-col items-center justify-center'>
                                                             <CgDanger size={12} />
                                                            </div>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent className="w-80">
                                                            <div className="flex justify-between space-x-4">
                                                                <div className="space-y-1">
                                                                    <p className="text-sm">
                                                                    There might be contextual issues with this promts, implement the promt-suggestion to improve the promt score, and your result!
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                </div>
                                                )}
                                                {suggestion2 && suggestion2 !== '-' && (
                                                <div className='relative text-sm border-2 border-amber-400 text-amber-400 font-semibold rounded-xl px-2 p-1 pr-5'>
                                                    {suggestion2}
                                                    <HoverCard>
                                                        <HoverCardTrigger asChild>
                                                            <div className='absolute h-5 w-5 border-0 right-0 bottom-0 bg-amber-400 rounded-br-[10px] rounded-tl-[10px] text-neutral-100 flex flex-col items-center justify-center'>
                                                             <CgDanger size={12} />
                                                            </div>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent className="w-80">
                                                            <div className="flex justify-between space-x-4">
                                                                <div className="space-y-1">
                                                                    <p className="text-sm">
                                                                        There might not be sufficient examples to garantee the repsonse you might envision, implement the promt-suggestion to improve the promt score, and your result!
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                </div>
                                                )}
                                                {suggestion3 && suggestion3 !== '-' && (
                                                <div className='relative text-sm border-2 border-violet-400 text-violet-400 font-semibold rounded-xl px-2 p-1 pr-5'>
                                                    {suggestion3}
                                                    <HoverCard>
                                                        <HoverCardTrigger asChild>
                                                            <div className='absolute h-5 w-5 border-0 right-0 bottom-0 bg-violet-400 rounded-br-[10px] rounded-tl-[10px] text-neutral-100 flex flex-col items-center justify-center'>
                                                             <CgDanger size={12} />
                                                            </div>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent className="w-80">
                                                            <div className="flex justify-between space-x-4">
                                                                <div className="space-y-1">
                                                                    <p className="text-sm">
                                                                    There might be formal issues with this promts, implement the promt-suggestion to improve the promt score, and your result!
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                </div>
                                                )}
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
                        className="flex-1 border-none bg-transparent outline-none pl-6 resize-none overflow-hidden z-20 mt-[4px]"
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
