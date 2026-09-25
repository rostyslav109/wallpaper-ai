export async function restyleImage(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    prompt: string
){
    console.log(`[MOCK] Restyling ${filename} with prompt: ${prompt}`);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {data: buffer, mimetype};
}