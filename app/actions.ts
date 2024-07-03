'use server';

import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js'

import { createStreamableValue } from 'ai/rsc';
import { CoreMessage, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { generateText } from 'ai';

import { z } from 'zod';


interface Answers {
  [key: number]: string;
}

interface SaveAnswersResult {
  success: boolean;
  error?: string;
  data?: any;
}

export async function saveAnswers(answers: Answers): Promise<SaveAnswersResult> {
  try {
    console.log("Attempting to save answers...");

    // Example data for prolific_id, grade, passed, start_time, end_time
    const prolific_id = "example_prolific_id";
    const grade = null;
    const passed = null;
    const start_time = new Date().toISOString();
    const end_time = new Date().toISOString();

    // Validate that all question_ids exist in the questions table
    const questionIds = Object.keys(answers).map(Number);
    const { data: existingQuestions, error: questionError } = await supabase
      .from('questions')
      .select('question_id')
      .in('question_id', questionIds);

    if (questionError) {
      console.error('Error fetching questions:', questionError);
      return { success: false, error: questionError.message };
    }

    const existingQuestionIds = existingQuestions.map((q: any) => q.question_id);

    // Filter out invalid question_ids
    const validAnswers = Object.entries(answers).filter(([taskIndex]) => {
      return existingQuestionIds.includes(Number(taskIndex));
    });

    if (validAnswers.length === 0) {
      return { success: false, error: 'No valid question IDs to insert' };
    }

    // Insert valid answers into the results table
    const { data, error } = await supabase
      .from('results')
      .insert(validAnswers.map(([taskIndex, answer]) => ({
        question_id: Number(taskIndex),
        prolific_id,
        response_text: answer,
        response_data: JSON.stringify({ taskIndex, answer }),
        grade,
        passed,
        start_time,
        end_time,
      })));

    if (error) {
      console.error('Error saving answers:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
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


export const fetchQuestions = async (study: number) => {
  const { data, error } = await supabase
    .from("questions")
    .select('*')
    .eq('study_id', study);

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
    .from('studien')
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