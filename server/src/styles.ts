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
    IMPORTANT: Keep the main subject recognizable and faithful to the original photograph.
    Preserve its exact proportions, silhouette, perspective, pose, structure, colors,
    materials, important details and distinctive characteristics.

    Do not redesign, replace, distort or invent the main subject.

    Transform the uploaded image into a sophisticated, highly detailed traditional oil painting
    on textured canvas.

    Use a rich impasto painting technique with clearly visible, thick layers of paint and
    natural brushstrokes. The surface should have authentic canvas texture and subtle
    variations in paint thickness. Avoid the appearance of a digital oil filter.

    Create the feeling of a hand-painted European fine-art painting, combining realistic
    proportions with slightly artistic simplification. Forms should be detailed and believable,
    but every surface should visibly consist of layered oil paint.

    Use harmonious, slightly muted colors with natural tonal transitions, soft atmospheric
    perspective and cinematic lighting.

    The original subject must remain the visual focal point.

    Integrate the subject naturally into the painted environment rather than simply applying
    a texture over the photograph. Reflections, shadows, highlights and surrounding objects
    should all be painted consistently with the new artistic medium.

    Add subtle imperfections characteristic of a real traditional painting: irregular brushwork,
    layered pigment, small variations in texture and slightly imperfect edges.

    Premium museum-quality traditional oil painting, authentic impasto, heavily textured canvas,
    visible brushstrokes, realistic painterly detail, elegant composition, timeless vintage
    fine-art aesthetic, atmospheric depth, natural lighting, handcrafted appearance.

    Do not make it look like a photograph with an oil filter.
    Make it look like the entire scene was originally painted by hand.

    Visual direction:
    Vintage European fine-art painting with a sophisticated, atmospheric aesthetic.
    Rich impasto, thick expressive brushstrokes, tactile canvas texture, muted natural colors,
    soft cinematic lighting and elegant painterly composition.
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
