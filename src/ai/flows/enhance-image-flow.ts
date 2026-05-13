'use server';
/**
 * @fileOverview An AI agent that enhances the quality and detail of an image.
 *
 * - enhanceImage - A function that handles the image enhancement process.
 * - EnhanceImageInput - The input type for the enhanceImage function.
 * - EnhanceImageOutput - The return type for the enhanceImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EnhanceImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be enhanced, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EnhanceImageInput = z.infer<typeof EnhanceImageInputSchema>;

const EnhanceImageOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe(
      "The enhanced photo, as a data URI that includes a MIME type and uses Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EnhanceImageOutput = z.infer<typeof EnhanceImageOutputSchema>;

export async function enhanceImage(input: EnhanceImageInput): Promise<EnhanceImageOutput> {
  return enhanceImageFlow(input);
}

const enhanceImageFlow = ai.defineFlow(
  {
    name: 'enhanceImageFlow',
    inputSchema: EnhanceImageInputSchema,
    outputSchema: EnhanceImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        {
          text: `Enhance the quality, clarity, and detail of the provided image.
                 If the image is low resolution, upscale it to a high-definition resolution suitable for a 1080x1080 profile picture without introducing pixelation or artifacts.
                 Ensure the output image is sharp, clear, and retains its original content and aspect ratio as much as possible while improving overall quality.`,
        },
        { media: { url: input.photoDataUri } },
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media) {
      throw new Error('Failed to enhance image: No media returned from the model.');
    }

    return {
      enhancedPhotoDataUri: media.url!,
    };
  }
);
