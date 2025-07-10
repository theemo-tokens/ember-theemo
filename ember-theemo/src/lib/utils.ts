import crypto from 'node:crypto';
import fs from 'node:fs';

export async function fingerprintFile(filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const cHash = crypto.createHash('MD5');
    const stream = fs.createReadStream(filename);

    stream.on('error', (err) => {
      reject(err);
    });
    stream.on('data', (chunk) => {
      cHash.update(chunk);
    });
    stream.on('end', () => {
      resolve(cHash.digest('hex'));
    });
  });
}
