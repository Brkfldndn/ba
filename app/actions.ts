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
  answer: string;
  // prompts: string;
  // test_for_prompts: string;
  test: string,
  unfinished_prompts: string;
  total_time_spent: number;
}

export async function saveAnswerstest(dummyDataArray: DummyData[]) {
  try {
    console.log("Attempting to save answers...");

    // Insert the dummy data into the results table
    const { data, error } = await supabase
      .from("results")
      .insert(dummyDataArray);

    if (error) {
      console.error('Error saving answers:', error.message, error.details, error.hint);
      return { success: false, error: error.message || 'Unknown error' };
    }

    console.log('Data saved:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Unexpected error:', error.message || 'An unexpected error occurred');
    return { success: false, error: error.message || 'An unexpected error occurred' };
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





// export async function generateGrade(input: string) {
//   'use server';

//   const { object: grade } = await generateObject({
//     model: openai('gpt-4-turbo'),
//     system: `rate the prompt from 0-5. The rating should correspond with how well the prompt is engineered. If the promt is likely going to return the intenden answer, the grade should be high for example. Only output the grade as a number`,
//     prompt: input,
//     schema: z.object({
//       grade: z.number()
//     })
//   });

//   console.log('Grade:', grade);
//   return grade;
// }



// generate grade methodically by categories all api calls run in parallel here
export async function generateGrade(input: string) {
  'use server';

  const categories = [
    { number: 1, name: "No Politeness", weight: 1, prompt: "Evaluate whether the prompt avoids politeness, if so assign 1. Assign a score of 0 or 1." },
    { number: 2, name: "Intended Audience", weight: 4, prompt: "Evaluate the prompt in terms of whether it contains informaiton about an audience that needs to be adressed, if you deem that to be necessary to receive the right response, e.g., an expert in the field. Assign a score of 0 or 1." },
   
    { number: 4, name: "Affirmative Directives", weight: 1, prompt: "Evaluate the prompt in terms of it uses affirmative directives providing directives are used at all, like 'do' instead of negative language. Assign a score of 0 or 1." },

    { number: 7, name: "Few-Shot Prompting", weight: 4, prompt: "Evaluate the prompt in terms of whether it provides sufficient examples or context . Not providing any is only justified if it is exactly clear what is meant like the promt: what is 1+1. Assign a score of 0 or 1." },
    { number: 8, name: "Formatting with Instructions", weight: 1, prompt: "Evaluate the prompt in terms of whether it uses clear formatting in general, ideally starting with '###Instruction###' and followed by examples or questions. Note that in certain cases it is not possible to do that as the prompt is not sufficiently long, or the prompt is structure so that it is very clear. Assign a score of 0 or 1." },
    { number: 9, name: "Use of Mandatory Phrases", weight: 1, prompt: "Evaluate the prompt in terms of whether it is incorporating mandatory phrases like 'Your task is' and 'You MUST'. Keep im mind that this is only nessecary if the prompt is 1 long enough and also not using the opposite, e.g. you can tell me.... Assign a score of 0 or 1." },
    
    { number: 12, name: "Use Leading Words", weight: 1, prompt: "Evaluate the prompt in terms of whether it is using leading words like 'think step by step', if the prompt is suffiently long and the it is even possible to take multiple steps. Sometimes it is not nessecary as it would propably not impact the response in a bad way. Assign a score of 0 or 1." },

    { number: 16, name: "Assigning a Role", weight: 4, prompt: "Evaluate the prompt whether it is assigning a specific role to the model in terms of its outputting in a specific lanuguage style. Take into axxount that that might only be nessecary in certain situations, where noch specifing that would lead to a likely wrong answer . Assign a score of 0 or 1." },
    { number: 17, name: "Use of Delimiters", weight: 1, prompt: "Evaluate the prompt whether it is using delimiters for clarity. Keep in mind that they might only be nessecary if a promt has sufficinet lenght or it would otherwise not clearly seperate thoughts. Assign a score of 0 or 1." },

    { number: 20, name: "Output Primers", weight: 4, prompt: "Evaluate the prompt whether it is using output primers to begin responses. Keep im mind that they are only nessecary in certain context where it might not be self evident on which context the person whos prompting might mean. Assign a score of 0 or 1." },

    { number: 25, name: "Clear Requirements", weight: 4, prompt: "Evaluate the prompt in terms of clearly stating model requirements using keywords or instructions. They only might not be nessecary when the response is self evident. Assign a score of 0 or 1." },
  ];
  
  

  // Perform API calls to get grades for each category
  const results = await Promise.all(
    categories.map(category => generateObject({
      model: openai('gpt-4-turbo'),
      system: category.prompt,
      prompt: input,
      schema: z.object({
        grade: z.number()
      })
    }))
  );

  // Extracts and calculates the weighted sum of grades
  const weightedSum = results.reduce((sum, result, index) => {
    const grade = result.object.grade;
    const weight = categories[index].weight;
    console.log(`Category ${categories[index].number} - ${categories[index].name}: Grade = ${grade}, Weight = ${weight}`);
    return sum + (grade * weight);
  }, 0);

  // Calculate the total weight
  const totalWeight = categories.reduce((sum, category) => sum + category.weight, 0);

  // Normalize the weighted sum and calculate the final grade
  const normalizedGrade = (weightedSum / totalWeight) * 5;
  const finalGrade = Math.round(normalizedGrade);

  // Wrap the final grade in a zod object and return
  const grade = z.object({ grade: z.number() }).parse({ grade: finalGrade });

  console.log('Final Grade:', grade.grade);
  return grade;
}



export async function generatePromtReplacement(input: string) {
  'use server';

  const { object: promtReplacement } = await generateObject({
    model: openai('gpt-4o'),
    system: `
    Your task is to improve the prompt that you received and output it as an improved prompt. This is the only thing you return. by adhering to the following principles while keeping the same semantic meaning:

    No Politeness: If there is politeness such as "please," "if you don’t mind," "thank you," or "I would like to.", change that to direct an concise language like "must" "have to".
    
    Affirmative Directives: If there is negative language like "don't.", change that to affirmative language, such as "do," This will ensure clear and direct communication.
    
    Formatting with Instructions: Utilize clear formatting in the prompt wiht markdown syntax. Put the prompt in a template consisting of 
    '### Instruction:  
    this is an instruction

    ### Context/Example:  
    this is context 
    
    ### Response:  
    ...'.
    
    This approach will help structure the prompt and make it easier to understand. Note that this is only necessary if the prompt is long or complex. Also seperate the parts by writing to a new line fo reach section.
    
    Use of Mandatory Phrases: Incorporate mandatory phrases such as "Your task is" and "You MUST" where applicable. 
    
    Use Leading Words: Include leading words like "think step by step" if the prompt is long and allows for multiple steps. However, avoid this if it does not contribute to a better understanding or if it does not significantly impact the response.
    
    Use of Delimiters: Apply delimiters for clarity, especially if the prompt is long or complex. Delimiters can help separate different sections or thoughts within the prompt. However, this is optional if the prompt is already clear and concise.
    
    

    formulate your response in markdown syntax; especially for formatting with instructions use bold Instructions and new lines to make the strcuture better 
    
    `,
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
    maxTokens: 30,
    system: `Your task is to assess the prompt for structure and clarity. If the prompt is well-structured or simple enough that poor structure would not lead to a bad response, output only "-". If the prompt has structural problems that might affect the response, point out the specific issue briefly and clearly. Do not respond to the content of the prompt itself, and keep all feedback concise. Avoid providing unnecessary explanations. Also just respond with "-", if there are problems with the context or language, you are only here to evaluate the clarity of the structure. When identifying issues, reduce feedback to its absolute minimum while retaining meaning. For example, instead of full explanations like "The prompt has structural problems and is unclear. It lacks necessary punctuation and has a typo in 'competitor lanscap'," write "Structural problems, unclear: lacks punctuation, typo 'lanscap'."`,
    prompt: input,
    schema: z.object({
      suggestions: z.string().optional()
    })
  });

  console.log('newSuggestions:', suggestions);
  return suggestions;
}



export async function generateSuggestion2(input: string) {
  'use server';

  const { object: suggestion2 } = await generateObject({
    model: openai('gpt-4o'),
    maxTokens: 30,
    system: `Your task is to assess the context and examples provided in the prompt. If the context and examples are sufficient for a proper response, output only "-".(example woutd be for: "what is 1+1 ?") If the context or examples are missing such that that there might be a variance in the response when context is not exactly specified, briefly point out the specific issue. Do not provide unnecessary details or explanations. Ensure you only focus on the adequacy of the context and examples, not the prompt structure or language. When identifying issues, reduce feedback to its absolute minimum while retaining meaning. For example, instead of full explanations like "The context is unclear and lacks sufficient examples to inform a good response," write "Context is unclear, insufficient examples."`,
    prompt: input,
    schema: z.object({
      suggestion2: z.string().optional()
    })
  });

  console.log('newSuggestions:', suggestion2);
  return suggestion2;
}

export async function generateSuggestion3(input: string) {
  'use server';

  const { object: suggestion2 } = await generateObject({
    model: openai('gpt-4o'),
    maxTokens: 30,
    system: `Your task is to assess the tone and style of the prompt. If the tone or style is irrelevant to the quality of the AI's response (e.g., simple factual prompts like "What is 1 plus 1?"), output only "-". If the tone or style could affect the AI's response, and is not specified, briefly state that it is not specified. When identifying issues, reduce feedback to its absolute minimum while retaining meaning. For example, instead of "The tone or style is not specified and may affect the response," write "Tone/style not specified."`,
    prompt: input,
    schema: z.object({
      suggestion2: z.string().optional()
    })
  });

  console.log('newSuggestions:', suggestion2);
  return suggestion2;
}








export async function generateDirection(input: string) {
  'use server';

  const { object: suggestions } = await generateObject({
    model: openai('gpt-4o'),
    system: `If and only if the promt is missing context in terms of the direction where the pompt should, then output something along the lines of "more context" etc. or as a question that nudges the promter to the missing direction of the promt  `,
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


export async function saveCritique(critiqueData: {
  sliderValue1: number;
  sliderValue2: number;
  textInput: string;
  PROLIFIC_PID?: string;
}) {
  // Set default prolific_id to '1111111' if not provided
  const prolific_id = critiqueData.PROLIFIC_PID || "1111111";

  console.log("critique action ran ")

  // Insert data into the 'participants' table in Supabase
  const { data, error } = await supabase
    .from("participants")
    .insert([
      {
        prolific_id: prolific_id,
        rating_1: critiqueData.sliderValue1,
        rating_2: critiqueData.sliderValue2,
        critique: critiqueData.textInput,
      },
    ]);

  if (error) {
    console.error("Error inserting data:", error);
    return { success: false, error };
  }

  console.log("Data inserted successfully:", data);
  return { success: true, data };
}