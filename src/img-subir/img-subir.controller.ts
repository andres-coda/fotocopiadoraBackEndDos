import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ImgSubirService } from './img-subir.service';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('img-subir')
export class ImgSubirController {
    constructor(private readonly imgSubirService: ImgSubirService) { }

    @Post()
    @UseGuards(AdminGuard)
    @UseInterceptors(FileInterceptor('image'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        const imageUrl = await this.imgSubirService.uploadImage(file);
        return { imageUrl }; // Devolver la URL de la imagen en la respuesta
    }
}