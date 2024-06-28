'use client';

import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Button } from "@/components/ui/button";
import { FaArrowUp } from "react-icons/fa6";
import { GiStarShuriken } from "react-icons/gi";
import { GoPerson, GoSearch } from "react-icons/go";
import { generateSug } from '../app/actions';
import { readStreamableValue } from 'ai/rsc';

const GPT = () => {
    const { messages, input, handleInputChange, handleSubmit, data } = useChat();
    const [isInputNotEmpty, setIsInputNotEmpty] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [debouncedInput, setDebouncedInput] = useState('');




    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedInput(input);
        }, 800);

        return () => {
            clearTimeout(handler);
        };
    }, [input]);

    useEffect(() => {
        if (debouncedInput) {
            (async () => {
                const { object } = await generateSug(debouncedInput);

                for await (const partialObject of readStreamableValue(object)) {
                    if (partialObject) {
                        setSuggestions(partialObject.notifications || []);
                    }
                }
            })();
        }
    }, [debouncedInput]);

    const handleInputChangeWithState = (e) => {
        handleInputChange(e);
        setIsInputNotEmpty(e.target.value.trim().length > 0);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSubmit(e);
            setIsInputNotEmpty(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        handleInputChange({ target: { value: input + suggestion.message.replace(new RegExp(`^${input}`, 'i'), '') } });
        setIsInputNotEmpty(true);
        setSuggestions([]);
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
                                    {message.content}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
            <div
                className={`flex ${isInputNotEmpty ? 'items-start flex-col pt-2' : 'items-center flex-row'} absolute bottom-0 w-full bg-neutral-100 rounded-3xl transition-all duration-300 pr-2 ${
                    isInputNotEmpty ? 'h-1/2' : 'h-16'
                }`}
            >
                <div className='flex flex-row w-full items-center pl-4'>
                    <div className={isInputNotEmpty ? `` : `text-neutral-400`}>
                        <GoSearch size={20}/>
                    </div>
                    <input
                        className="flex-1 border-none bg-transparent outline-none pl-6"
                        value={input}
                        onChange={handleInputChangeWithState}
                        onKeyPress={handleKeyPress}
                        placeholder="Send a message to Chat-GPT..."
                    />
                    <Button
                        className={`h-[46px] w-[46px] ${isInputNotEmpty ? `border-none bg-black` : ` border-2 border-neutral-200 bg-white text-neutral-300`} rounded-3xl`}
                        onClick={handleSubmit}
                        disabled={input.trim() === ""}
                    >
                        <FaArrowUp size={15} />
                    </Button>
                </div>
                
                {isInputNotEmpty && (
                    <div className="mt-2 w-full border-t overflow-scroll">
                        {suggestions.map((suggestion, index) => {
                            const typedPart = input;
                            const suggestionPart = suggestion.message?.replace(new RegExp(`^${typedPart}`, 'i'), '') || '';
                            return (
                                <div
                                    key={index}
                                    className="relative p-2 hover:bg-neutral-300 transition duration-300 pl-4 group cursor-pointer"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    <div className="absolute left-0 bottom-0 w-1 h-full bg-[#21d9c3] rounded-r-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                                    <div className='flex flex-row items-center w-full'>
                                        <GoSearch />
                                        <div className="pl-6">
                                            {typedPart}<strong>{suggestionPart}</strong>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GPT;
