import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DtoUserParcial } from './dto/DtoUserParcial.dto';
import { UsuarioService } from 'src/usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private usersService: UsuarioService, private jwtService: JwtService) {}
// se utiliza el servicio del usuario para obtener sus datos, retorna un token provisto por jwt
    async signIn(email: string, pass: string): Promise<{ access_token: string }> {
      //busca si los datos proporcionados coindicen con un usuario creado utilizando el email  
      const user = await this.usersService.getUsuarioByEmail(email);
      //si no hay usuario creado o la password no coincide con la ingresada retorna no autorizado
        if (!user || user.password !== pass) {
            throw new UnauthorizedException();
        }
             //sino, si los datos son correctos abtiene el id, el email y el rol 
           const payload = { sub: user.idUsuario, email:user.email, role: user.role };
           //retorna un token de seguridad creado exclusivamente para ese usuario logueado
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }

    //método utilizado para UsuarioGuard
    async getUserFromRequest(request: Request):Promise<DtoUserParcial> {
        const authHeader = request.headers['authorization'];
        if (!authHeader) {
          return null; // No se proporcionó encabezado de autorización
        }
        // El encabezado de autorización debería tener el formato "Bearer token"
        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer' || !token) {
          throw new UnauthorizedException('Formato de token no válido');
        }
          try {
          // Decodificar el token JWT para obtener los datos del usuario
          const user = this.jwtService.verify(token);
          return user;
        } catch (error) {
          throw new UnauthorizedException('Token inválido');
        }
      }
}