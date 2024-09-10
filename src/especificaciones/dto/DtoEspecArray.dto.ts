import { Type } from "class-transformer";
import { IsNotEmpty, ValidateNested } from "class-validator";
import { Especificaciones } from "../entidad/Especificaciones.entity";

export class DtoEspecArray {
    @IsNotEmpty()
    @ValidateNested({each:true})
    @Type(()=>Especificaciones)
    especificaciones:Especificaciones[]
}