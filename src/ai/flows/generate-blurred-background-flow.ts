'use server';
/**
 * @fileOverview A Genkit flow to intelligently generate a blurred background extension for an input photo.
 *
 * - generateBlurredBackground - A function that handles the blurred background generation process.
 * - GenerateBlurredBackgroundInput - The input type for the generateBlurredBackground function.
 * - GenerateBlurredBackgroundOutput - The return type for the generateBlurredBackground function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const GenerateBlurredBackgroundInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  subjectDescription: z
    .string()
    .optional()
    .describe(
      'An optional description of the main subject in the photo to guide the AI in framing.'
    ),
});
export type GenerateBlurredBackgroundInput = z.infer<typeof GenerateBlurredBackgroundInputSchema>;

// Output Schema
const GenerateBlurredBackgroundOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe(
      "The generated photo with a blurred background extension, as a data URI that includes a MIME type and uses Base64 encoding. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateBlurredBackgroundOutput = z.infer<typeof GenerateBlurredBackgroundOutputSchema>;

/**
 * Generates a blurred background extension for a given photo, intelligently framing the main subject.
 * @param input - The input containing the photo as a data URI and an optional subject description.
 * @returns The enhanced photo with a blurred background as a data URI.
 */
export async function generateBlurredBackground(
  input: GenerateBlurredBackgroundInput
): Promise<GenerateBlurredBackgroundOutput> {
  return generateBlurredBackgroundFlow(input);
}

const generateBlurredBackgroundFlow = ai.defineFlow(
  {
    name: 'generateBlurredBackgroundFlow',
    inputSchema: GenerateBlurredBackgroundInputSchema,
    outputSchema: GenerateBlurredBackgroundOutputSchema,
  },
  async (input) => {
    const textPrompt = `Extend this image with a blurred background around the main subject. Ensure the subject remains perfectly framed and the surrounding area seamlessly blends without cropping. The output should be a square image.`;
    const subjectHint = input.subjectDescription
      ? ` The main subject is described as: ${input.subjectDescription}.`
      : '';

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image', // Using image-to-image model
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: textPrompt + subjectHint },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Required for image generation with Gemini 2.5 Flash Image
      },
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate blurred background image: No media returned.');
    }

    return {
      enhancedPhotoDataUri: media.url,
    };
  }
);
