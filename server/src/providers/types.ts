export type ImageResult = {
  data: Buffer;
  mimetype: string;
};

export interface ImageProvider {
  name: string;
  restyle(image: Buffer, mimetype: string, prompt: string): Promise<ImageResult>;
}