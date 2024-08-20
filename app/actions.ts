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

  // Generate grades for different aspects of the prompt
  const [result1, result2, result3] = await Promise.all([
    generateObject({
      model: openai('gpt-4-turbo'),
      system: `Rate the promt in terms of Prompt Structure and Clarity; you can assign a score of 0 or 1, with 0 meaning the category is not sufficiently true and 1 meaning it is.

      `,
      prompt: input,
      schema: z.object({
        grade: z.number()
      })
    }),
    generateObject({
      model: openai('gpt-4-turbo'),
      system: `Rate the promt in terms of Specificity and Information: Is there context if it is necessary (meaning it could be misunderstood)? Are there enough examples if examples are necessary (e.g., few-shot prompting)?
      ; you can assign a score of 0 or 1, with 0 meaning the category is not sufficiently true and 1 meaning it is.

      `,
      prompt: input,
      schema: z.object({
        grade: z.number()
      })
    }),
    generateObject({
      model: openai('gpt-4-turbo'),
      system: `Rate the promt in terms of Content and Language Style: Is the tone and style of response instructed if deemed necessary (e.g., a different output might occur if not specified)?; 
      you can assign a score of 0 or 1, with 0 meaning the category is not sufficiently true and 1 meaning it is.

      `,
      prompt: input,
      schema: z.object({
        grade: z.number()
      })
    })
  ]);

  // Extract the grades
  const grade1 = result1.object.grade;
  const grade2 = result2.object.grade;
  const grade3 = result3.object.grade;

  // Calculate the RMS of the grades and scale to the final grade
  const grades = [grade1, grade2, grade3].map(Number);
  const rms = Math.sqrt(grades.reduce((sum, grade) => sum + grade ** 2, 0) / grades.length);
  const finalGrade = Math.round(rms * 5);

  // Wrap the final grade in a zod object and return
  const grade = z.object({ grade: z.number() }).parse({ grade: finalGrade });

  console.log('Final Grade:', grade.grade);
  return grade;
}



export async function generatePromtReplacement(input: string) {
  'use server';

  const { object: promtReplacement } = await generateObject({
    model: openai('gpt-4-turbo'),
    system: `If the promt is engineered/written in a bad way and the promt could be improved keeping the same semantic, then generate such promt. so only output the improved promt.
            this is a list of things that can be improved. Note the order does not determine the importance of the principle. Also only implement a priciple if you have sufficient information otherwise dont do that. 
            This is the List: 
            #Principle Prompt Principle for Instructions
            1
            If you prefer more concise answers, no need to be polite with LLM so there is no need to add phrases like
            “please”, “if you don’t mind”, “thank you”, “I would like to”, etc., and get straight to the point.
            2 Integrate the intended audience in the prompt, e.g., the audience is an expert in the field.
            3 Break down complex tasks into a sequence of simpler prompts in an interactive conversation.
            4 Employ affirmative directives such as ‘do,’ while steering clear of negative language like ‘don’t’.
            5
            When you need clarity or a deeper understanding of a topic, idea, or any piece of information, utilize the
            following prompts:
            o Explain [insert specific topic] in simple terms.
            o Explain to me like I’m 11 years old.
            o Explain to me as if I’m a beginner in [field].
            o Write the [essay/text/paragraph] using simple English like you’re explaining something to a 5-year-old.
            6 Add “I’m going to tip $xxx for a better solution!”
            7 Implement example-driven prompting (Use few-shot prompting).
            8
            When formatting your prompt, start with ‘###Instruction###’, followed by either ‘###Example###’
            or ‘###Question###’ if relevant. Subsequently, present your content. Use one or more
            line breaks to separate instructions, examples, questions, context, and input data.
            9 Incorporate the following phrases: “Your task is” and “You MUST”.
            10 Incorporate the following phrases: “You will be penalized”.
            11 Use the phrase ”Answer a question given in a natural, human-like manner” in your prompts.
            12 Use leading words like writing “think step by step”.
            13 Add to your prompt the following phrase “Ensure that your answer is unbiased and avoids relying on stereotypes.”
            14
            Allow the model to elicit precise details and requirements from you by asking you questions until he has
            enough information to provide the needed output (for example, “From now on, I would like you to ask me
            questions to ...”).
            15
            To inquire about a specific topic or idea or any information and you want to test your understanding, you can use
            the following phrase: “Teach me any [theorem/topic/rule name] and include a test at the end, and let me know if
            my answers are correct after I respond, without providing the answers beforehand.”
            16 Assign a role to the large language models.
            17 Use Delimiters.
            18 Repeat a specific word or phrase multiple times within a prompt.
            19 Combine Chain-of-thought (CoT) with few-Shot prompts.
            20
            Use output primers, which involve concluding your prompt with the beginning of the desired output. Utilize output
            primers by ending your prompt with the start of the anticipated response.
            21
            To write an essay /text /paragraph /article or any type of text that should be detailed: “Write a detailed [essay/text
            /paragraph] for me on [topic] in detail by adding all the information necessary”.
            22
            To correct/change specific text without changing its style: “Try to revise every paragraph sent by users. You should
            only improve the user’s grammar and vocabulary and make sure it sounds natural. You should maintain the original
            writing style, ensuring that a formal paragraph remains formal.”
            23
            When you have a complex coding prompt that may be in different files: “From now and on whenever you generate
            code that spans more than one file, generate a [programming language ] script that can be run to automatically
            create the specified files or make changes to existing files to insert the generated code. [your question]”.
            24
            When you want to initiate or continue a text using specific words, phrases, or sentences, utilize the following
            prompt:
            o I’m providing you with the beginning [song lyrics/story/paragraph/essay...]: [Insert lyrics/words/sentence].
            Finish it based on the words provided. Keep the flow consistent.
            25
            Clearly state the requirements that the model must follow in order to produce content,
            in the form of the keywords, regulations, hint, or instructions
            26
            To write any text, such as an essay or paragraph, that is intended to be similar to a provided sample, include the
            following instructions:
            o Use the same language based on the provided paragraph[/title/text /essay/answer].
    
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
    system: `If the promt is missing context say what context needs to be, this can also be the sentence "give an example" .`,
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
    model: openai('gpt-4-turbo'),
    system: `If the promt is missing the format it should be outputed as return "which format", if it is unclear as to which format is meant output a short question concerning the output to clarify it. these are the only topics on which you output anything .`,
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
    model: openai('gpt-4-turbo'),
    system: `If the promt is missing the format it should be outputed as return "which format", if it is unclear as to which format is meant output a short question concerning the output to clarify it. these are the only topics on which you output anything .`,
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