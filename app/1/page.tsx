'use client';

import { useState, useEffect } from 'react';
import { generateSug } from '../actions';
import { readStreamableValue } from 'ai/rsc';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export default function Home() {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [debouncedInput, setDebouncedInput] = useState('');

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInput(input);
    }, 1000);

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

  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message here..."
        className="p-2 border border-gray-300 rounded"
      />
      <button
        onClick={async () => {
          const { object } = await generateSug('Messages during finals week.');

          for await (const partialObject of readStreamableValue(object)) {
            if (partialObject) {
              setSuggestions(partialObject.notifications || []);
            }
          }
        }}
        className="mt-4 p-2 bg-blue-500 text-white rounded"
      >
        Ask
      </button>

      <div className="mt-4 w-full flex flex-col">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="p-2 border-b last:border-b-0 hover:bg-gray-200">
            {suggestion.message}
          </div>
        ))}
      </div>
    </div>
  );
}
