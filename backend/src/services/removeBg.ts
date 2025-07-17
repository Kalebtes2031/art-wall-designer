import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';

export async function removeBackground(filePath: string): Promise<string> {
  const form = new FormData();
  form.append('image_file', fs.createReadStream(filePath));
  form.append('size', 'auto');

  const response = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
    headers: {
      ...form.getHeaders(),
      'X-Api-Key': process.env.REMOVE_BG_API_KEY!,
    },
    responseType: 'arraybuffer',
  });

  const outputFile = filePath.replace(/\.(jpg|jpeg|png)$/, '-transparent.png');
  fs.writeFileSync(outputFile, response.data);

  return `/uploads/${path.basename(outputFile)}`;
}