import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class UsuarioGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Verifica si hay un usuario autenticado
    const user = this.authService.getUserFromRequest(request);
    if (user) {
      // Si hay un usuario, adjunta los datos del usuario a la solicitud para su posterior uso
      request.user = user;
    }
    // Permite el acceso independientemente
    return true;
  }
}