import { Injectable } from '@nestjs/common';
import * as https from 'https';
import * as fs from 'fs';
import * as FormData from 'form-data';

@Injectable()
export class ImgSubirService {
    private readonly imgbbApiKey = '4ab8ecb1c53ed89e9ab0f17a5e151b77';
    async uploadImage(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new Error('No se ha proporcionado ningún archivo.');
        }
        const imagePath = file.path;
        const imageData = fs.readFileSync(imagePath);
        const base64Image = imageData.toString('base64');
    
        const formData = new FormData();
        formData.append('image', base64Image);
    
        const options = {
          method: 'POST',
          hostname: 'api.imgbb.com',
          path: `/1/upload?key=${this.imgbbApiKey}`,
          headers: formData.getHeaders(),
        };
    
        return new Promise((resolve, reject) => {
          const req = https.request(options, (res) => {
            let responseData = '';
    
            res.on('data', (chunk) => {
              responseData += chunk;
            });
    
            res.on('end', () => {
              fs.unlinkSync(imagePath); // Eliminar el archivo temporal
              const response = JSON.parse(responseData);
              if (response.success) {
                resolve(response.data.url); // Devolver la URL de la imagen
              } else {
                reject(new Error(response.data.error.message));
              }
            });
          });
    
          req.on('error', (error) => {
            fs.unlinkSync(imagePath); // Eliminar el archivo temporal en caso de error
            reject(new Error(error.message));
          });
    
          formData.pipe(req);
        });
      }
    }