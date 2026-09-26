type Style = {
  id: string;
  name: string;
  description: string;
  prompt: string;
};

export const styles: Style[] = [
{
    id: "oil",
    name: "Oil Painting",
    description: "Thick brushstrokes and rich, textured paint — like a classic gallery canvas.",
    prompt: `
    Transform the user-uploaded image into an impasto oil painting in the style of image_0.png. The output must preserve the original scene's composition, objects, lighting, and core details, but render them using extremely heavy, thick, and physically deep textured paint layers. Employ a distinct, textured brush and palette knife technique throughout. Every surface (water, vehicles, people, background, details) must show tactile depth with individual paint strokes visible, catching the light and creating a sculpted paint texture. The colors should be rich, deep, and vibrant, mirroring the intensity of image_0.png. Avoid any photorealistic rendering; all elements must be clearly built from tangible paint. Use dynamic, bold application of paint with non-blended, heavy strokes. Emphasize the tactile quality of the paint medium itself as the primary stylistic feature. The overall texture should be complex, intricate, and deeply dimensional, as if the painting is a physical object. The background elements (e.g., the sky, distant objects, fine details) should be rendered with the same level of texture and detail as the foreground. The painting should feel cohesive and hand-rendered. Maintain a consistent, high-end, gallery-quality art piece feel.
    `,
    },
    {
    id: "watercolor",
    name: "Watercolor",
    description: "Soft washes of color that bleed gently into textured paper.",
    prompt: `
    Transform this image into a beautiful traditional watercolor painting.
    Preserve the main subject, its proportions, details and original composition.
    Use soft translucent color washes, gentle color bleeding, natural paper texture,
    subtle brushwork and delicate atmospheric lighting.
    Make it look hand-painted on real watercolor paper, not digitally filtered.
    `,
    },

    {
    id: "impressionism",
    name: "Impressionism",
    description: "Loose, vivid dabs of light and color in the spirit of Monet.",
    prompt: `
    Transform this image into a traditional Impressionist painting.
    Preserve the main subject, proportions and original composition.
    Use loose visible brushstrokes, colorful dabs of paint, vibrant natural light,
    soft edges and atmospheric depth.
    Create the feeling of a hand-painted 19th-century French Impressionist artwork.
    `,
    },

    {
    id: "pencil",
    name: "Pencil Sketch",
    description: "Hand-drawn graphite lines and soft shading on white paper.",
    prompt: `
    Transform this image into a detailed hand-drawn graphite pencil sketch.
    Preserve the main subject, proportions, important details and original composition.
    Use fine graphite lines, natural imperfections, cross-hatching and soft shading
    on textured white paper.
    Make it look genuinely drawn by hand, not digitally filtered.
    `,
    },

    {
    id: "anime",
    name: "Anime",
    description: "Clean line art and vibrant cel shading, like a frame from an animated film.",
    prompt: `
    Transform this image into a high-quality anime illustration.
    Preserve the main subject, recognizable features, proportions and composition.
    Use clean expressive line art, vibrant cel shading, polished colors and
    a beautifully painted atmospheric background.
    Make it look like a frame from a premium animated film.
    `,
    },

    {
    id: "pixel",
    name: "Pixel Art",
    description: "A retro 16-bit video game look with a limited color palette.",
    prompt: `
    Transform this image into detailed retro 16-bit pixel art.
    Preserve the main subject, silhouette and original composition.
    Use crisp square pixels, a carefully limited color palette, strong pixel shading
    and authentic retro game aesthetics.
    No blur, gradients or smooth digital edges.
    `,
    },

    {
    id: "neon",
    name: "Neon Cyberpunk",
    description: "A futuristic night glow of neon pinks, purples and electric blues.",
    prompt: `
    Transform this image into a cinematic neon cyberpunk scene at night.
    Preserve the main subject, its recognizable shape, proportions and composition.
    Use glowing neon pink, purple and electric blue lights, wet reflections,
    deep shadows, atmospheric fog and futuristic city details.
    Create a polished high-end cyberpunk aesthetic.
    `,
    },

    {
    id: "lowpoly",
    name: "Low Poly",
    description: "Geometric facets and flat colors, like a minimalist 3D model.",
    prompt: `
    Transform this image into a clean low-poly 3D artwork.
    Preserve the main subject, silhouette, proportions and original composition.
    Construct the subject from geometric polygonal facets with flat shading,
    simplified forms and a refined minimalist color palette.
    Make it look like a professionally designed 3D model.
    `,
    },
];
