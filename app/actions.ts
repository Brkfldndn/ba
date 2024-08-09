'use server';

import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js'

import { createStreamableValue } from 'ai/rsc';
import { CoreMessage, generateObject, streamText } from 'ai';
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


export async function saveAnswers(formattedAnswers: any[]): Promise<SaveAnswersResult> {
  try {
    console.log("Attempting to save answers...");

    // Insert the answers into the results table
    const { data, error } = await supabase
      .from('results')
      .insert(formattedAnswers);

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


export interface DummyData {
  created_at: string;
  question_id: number;
  prolific_id: string;
  response_text: string;
  response_data: string;
  grade: number;
  passed: boolean;
  start_time: string;
  end_time: string;
}

export async function saveAnswerstest(dummyDataArray: DummyData[]) {
  try {
    console.log("Attempting to save answers...");

    // Insert the dummy data into the results table
    const { data, error } = await supabase
      .from('results')
      .insert(dummyDataArray);

    if (error) {
      console.error('Error saving answers:', error);
      return { success: false, error: error.message };
    }

    console.log('Data saved:', data);
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
      system: '',
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

export async function generateRating(input: string) {
  'use server';

  const { object: ratingResult } = await generateObject({
    model: openai('gpt-4-turbo'),
    system: `Mach 4 Dinge: 1. bewerte den prompt auf einer Skala von 0-10, 
             2. Überlege dir was bei dem prompt fehlt, um noch besser abzuschneiden. 
             Mögliche Kategorien sind "length" im Sinne von der prompt ist zu kurz, "context" im Sinne von der Kontext ist nicht klar, 
             "instruction" im Sinne von die Aufgabenstellung ist nicht klar. 
             3. Überlege dir einen Verbesserungsvorschlag für die entsprechende Kategorie in einem kurzen Satz, 
             dies kann auch eine Frage bzw. Gegenfrage sein. 
             Dein Output hat JSON-Format wie z.B. {
              "grade": 5,
              "categories": [
                { "context": "Der Kontext ist nicht klar" },
                { "instruction": "Sollen die Antworten in Fließtext oder in Stichpunkten erfolgen?" }
              ]
            } 
             Maximale Kategorien sollen 3 sein, falls diese nicht unbedingt notwendig sind, bitte weglassen
            Falls der promt schelcht formuliert ist und es sich logisch erschließt einen besseren promt zu bauen überlege dir einen neuen promt mit der gleichen Semantik aber mit anderen enstprechenden Formulierung; aber nur wenn der promt schon lang genueg ist und auch nicht falls es nicht notwendig ist , 
            Das Json Format ist dementsprechend zu erweitern, hier ein beispiel:
            {
              "grade": 5,
              "categories": [
                { "context": "Kontext nicht klar" },
                { "instruction": "Fließtext oder Stichpunkte ?" }
              ],
              "promtReplacement": "Wie viel Seiten hat ein Würfel ?"
            }
            Wichtig ist für alle categories sowie promtreplacements dass sie so kurz und prägnant sind wie möglich ohne "." bzw auch wenn nötig nicht vollständig grammatikalisch richtig
             `,
    prompt: input,
    schema: z.object({
      grade: z.number(),
      categories: z.array(
        z.object({
          context: z.string().optional(),
          instruction: z.string().optional(),
          length: z.string().optional(),
        })
      ).optional(),
      promtReplacement: z.string().optional()
    }),
  });

  console.log('Rating Result:', ratingResult);
  return ratingResult;
}





export async function generateGrade(input: string) {
  'use server';

  const { object: grade } = await generateObject({
    model: openai('gpt-4-turbo'),
    system: `rate the prompt from 0-5. The rating should correspond with how well the prompt is engineered. If the promt is likely going to return the intenden answer, the grade should be high for example. Only output the grade as a number`,
    prompt: input,
    schema: z.object({
      grade: z.number()
    })
  });

  console.log('Grade:', grade);
  return grade;
}


export async function generatePromtReplacement(input: string) {
  'use server';

  const { object: promtReplacement } = await generateObject({
    model: openai('gpt-4-turbo'),
    system: `If the promt is engineered/written in a bad way and the promt could be improved keeping the same semantic, then generate such promt. so only output the improved promt.`,
    prompt: input,
    schema: z.object({
      promtReplacement: z.string().optional()
    })
  });

  console.log('newPromt:', promtReplacement);
  return promtReplacement;
}

export async function generateSuggestions(input: string) {
  'use server';

  const { object: suggestions } = await generateObject({
    model: openai('gpt-4-turbo'),
    system: `If the promt is missing context say what context needs to be, this can also be the sentence "give an example" .`,
    prompt: input,
    schema: z.object({
      suggestions: z.string().optional()
    })
  });

  console.log('newSuggestions:', suggestions);
  return suggestions;
}


export async function generateDirection(input: string) {
  'use server';

  const { object: suggestions } = await generateObject({
    model: openai('gpt-4-turbo'),
    system: `If and only if the promt is missing context in terms of the direction where the pomt should, then output something along the lines of "more context" etc. or as a question that nudges the promter to the missing direction of the promt  `,
    prompt: input,
    schema: z.object({
      promtDirection: z.string().optional()
    })
  });

  console.log('newSuggestions:', suggestions);
  return suggestions;
}


export async function generateExample(input: string) {
  'use server';

  const { object: suggestions } = await generateObject({
    model: openai('gpt-4-turbo'),
    system: `If and only if the promt is missing context in terms of the direction where the pomt should, then output something along the lines of "more context" etc. or as a question that nudges the promter to the missing direction of the promt  `,
    prompt: input,
    schema: z.object({
      promtExample: z.string().optional()
    })
  });

  console.log('newSuggestions:', suggestions);
  return suggestions;
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

export const fetchStudyInstruction = async (study: string) => {
  console.log('Received study parameter:', study);

  if (study === undefined) {
    console.error('Received study parameter is undefined');
    throw new Error('Invalid study parameter');
  }

  const { data, error } = await supabase
    .from('studien')
    .select('*')
    .eq('study_id', study)
    .single();
    

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