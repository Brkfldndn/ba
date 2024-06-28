'use server';

import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js'

import { createStreamableValue } from 'ai/rsc';
import { CoreMessage, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { generateText } from 'ai';

import { z } from 'zod';


// Define the type for the answers
interface Answers {
  [key: string]: string;
}

// Define the return type for the saveAnswers function
interface SaveAnswersResult {
  success: boolean;
  data?: any;
  error?: string;
}



export async function saveAnswers(answers: Answers): Promise<SaveAnswersResult> {
  try {
    // You might want to add additional processing here, such as adding a timestamp or user ID
    const { data, error } = await supabase
      .from('answers')
      .insert(Object.entries(answers).map(([taskIndex, answer]) => ({
        task_index: taskIndex,
        answer: answer,
        submitted_at: new Date().toISOString()
      })))

    if (error) {
      console.error('Error saving answers:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}



export async function generateSug(input: string) {
  'use server';

  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = await streamObject({
      model: openai('gpt-4-turbo'),
      system: 'You gernerate autocomplete suggestion based on an unfinished promt',
      prompt: input,
      schema: z.object({
        notifications: z.array(
          z.object({
            // name: z.string().describe('Name of a fictional person.'),
            message: z.string().describe('Just the part of the promt the user has not yet typed in'),
            // minutesAgo: z.number(),
          }),
        ),
      }),
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}



export async function generate(input: string) {
  'use server';

  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = await streamObject({
      model: openai('gpt-4-turbo'),
      system: 'You generate three notifications for a messages app.',
      prompt: input,
      schema: z.object({
        notifications: z.array(
          z.object({
            name: z.string().describe('Name of a fictional person.'),
            message: z.string().describe('Do not use emojis or links.'),
            minutesAgo: z.number(),
          }),
        ),
      }),
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}

export const generateTextAction = async () => {
  const result = await generateText({
    model: openai("gpt-4o"),
    temperature: 1,
    prompt: "Tell me a joke.",
  });
  return result.text;
};


export async function continueConversation(messages: CoreMessage[]) {
  'use server';
  const result = await streamText({
    model: openai('gpt-3-turbo'),
    messages,
  });
  const data = { test: 'hello' };
  const stream = createStreamableValue(result.textStream);
  return { message: stream.value, data };
}

export const fetchStudyTasks = async (study: string) => {
  const { data, error } = await supabase
    .from(study)
    .select('aufgabenstellung');

  if (error) {
    console.error('Error fetching data:', error);
    throw new Error(error.message);
  }

  return data;
};

export const fetchStudyInstruction = async (study: number) => {
  console.log('Received study parameter:', study);

  if (study === undefined) {
    console.error('Received study parameter is undefined');
    throw new Error('Invalid study parameter');
  }

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('study_id', study);

  if (error) {
    console.error('Error fetching data:', error);
    throw new Error(error.message);
  }

  console.log('Fetched study instruction 3 data:', data);
  return data;
};




export const fetchStudyInstruction3 = async (study: number) => {
  console.log('Received study parameter:', study);

  if (study === undefined) {
    console.error('Received study parameter is undefined');
    throw new Error('Invalid study parameter');
  }

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('study_id', study);

  if (error) {
    console.error('Error fetching data:', error);
    throw new Error(error.message);
  }

  console.log('Fetched study instruction 3 data:', data);
  return data;
};