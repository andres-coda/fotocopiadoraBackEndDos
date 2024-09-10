import { Controller, Get, Request, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { DtoUserParcial } from './dto/DtoUserParcial.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }
  
    //login
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() signInDto: LoginDto) {
      return await this.authService.signIn(signInDto.email, signInDto.password);
    }
  
  
  //acceso al perfil
    @Get('profile')
    async getUserFromRequest(@Request() req: Request & {user:DtoUserParcial}):Promise<DtoUserParcial> {
      return await this.authService.getUserFromRequest(req);
    }
  
  }
  