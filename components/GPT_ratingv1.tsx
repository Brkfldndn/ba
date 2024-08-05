'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FaArrowUp } from "react-icons/fa6";
import { GoSearch } from "react-icons/go";
import { generateGrade, generatePromtReplacement, generateRating, generateSuggestions } from '../app/actions';

interface GPT_ratingv1Props {
    group: string;
}

const GPT_ratingv1: React.FC<GPT_ratingv1Props> = ({ group }) => {
    const [input, setInput] = useState('');
    const [isInputNotEmpty, setIsInputNotEmpty] = useState(false);
    const [debouncedInput, setDebouncedInput] = useState('');
    const [ratingResult, setRatingResult] = useState({
        grade: 0,
        categories: {},
        promtReplacement: ""
    });
    const [grade, setGrade] = useState<string>("");
    const [promtReplacement, setPromtReplacement] = useState<string | undefined>("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
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
                try {
                    const gradeResponse = await generateGrade(debouncedInput);
                    const gradeValue = gradeResponse?.grade ?? 0; // Extract the grade value
                    setGrade(String(gradeValue)); // Ensure grade is a string
                    console.log('Grade:', gradeValue);
                } catch (error) {
                    console.error('Error generating grade:', error);
                }
            })();
        }
    }, [debouncedInput]);

    // Generate prompt replacement
    useEffect(() => {
        if (group === 'treatment' && debouncedInput && debouncedInput.split(' ').filter(word => word.length > 0).length > 4) {
            (async () => {
                try {
                    const promtReplacementResponse = await generatePromtReplacement(debouncedInput);
                    const promtReplacementValue = promtReplacementResponse?.promtReplacement ?? ''; // Extract the promtReplacement property
                    setPromtReplacement(promtReplacementValue); // Set the extracted value
                    console.log('newPromtreplacement:', promtReplacementResponse);
                } catch (error) {
                    console.error('Error generating prompt replacement:', error);
                }
            })();
        }
    }, [debouncedInput]);

    // Generate suggestions
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

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInput(value);
        setIsInputNotEmpty(value.trim().length > 0);
        autoResizeTextarea();

        if (input.length === 0) {
            setGrade("");
            setPromtReplacement("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            setDebouncedInput(input);
        }
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

    const getGradeColor = (grade) => {
        const startColor = [220, 53, 69]; // Red
        const endColor = [40, 167, 69];   // Green

        const interpolateColor = (start, end, factor) => {
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
                className={`flex ${isInputNotEmpty ? 'items-start flex-col pt-2' : 'items-center flex-row'} absolute bottom-0 w-full bg-neutral-100 rounded-3xl transition-all duration-300 pr-2 ${
                    isInputNotEmpty ? '' : 'h-16'
                }`}
            >
                {isInputNotEmpty && (
                    <div className="w-full overflow-scroll">
                        <div className="p-2 rounded text-left">
                            <div className="flex flex-row gap-5 items-start">
                                <div className="flex flex-col gap-3">
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
                                    {ratingResult.promtReplacement && (
                                        <div className='ml-12 rounded-lg bg-blue-600 text-white font-medium p-1 px-2'>{ratingResult.promtReplacement}</div>
                                    )}
                                    <div className='ml-12 border-t-2 border-r-2 border-l-2 rounded-t-xl px-4 p-1 cursor-pointer hover:bg-blue-500 hover:translate-y-4 z-50 transition duration-200' onClick={handlePromtReplacementClick}>
                                        {promtReplacement}
                                    </div>
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
                            className="text-lg font-semibold border-2 rounded-full w-8 h-8 min-w-8 flex items-center justify-center"
                            style={{
                                color: getGradeColor(Number(grade)),
                                borderColor: getGradeColor(Number(grade))
                            }}
                        >
                            {grade}
                        </div>
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
                        className={`h-[46px] w-[46px] ${isInputNotEmpty ? `border-none bg-black` : ` border-2 border-neutral-200 bg-white text-neutral-300`} rounded-3xl`}
                        onClick={() => setDebouncedInput(input)}
                        disabled={input.trim() === ""}
                    >
                        <FaArrowUp size={15} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GPT_ratingv1;
