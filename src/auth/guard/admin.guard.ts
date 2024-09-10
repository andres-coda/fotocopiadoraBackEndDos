import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Role } from "../rol/rol.enum";
import { jwtConstants } from "../constants";

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        
        try {
            const payload = this.jwtService.verify(token, { secret: jwtConstants.secret });


            if (payload.role !== Role.Admin) {
                throw new UnauthorizedException('Acceso denegado: se requiere rol de administrador.');
            }

            request.user = payload; // Asigna el payload al objeto de solicitud para que esté disponible en los controladores de ruta
            return true;
        } catch (error) {
            throw new UnauthorizedException('Token de autorización inválido.Debe loguearse');
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
          return authHeader.split(' ')[1];
        }
        return undefined;
      }
    }