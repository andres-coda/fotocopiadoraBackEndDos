import { IsNotEmpty } from "class-validator";
import { Role } from "src/auth/rol/rol.enum";

export class DtoRole {
    @IsNotEmpty()
    role: Role
}