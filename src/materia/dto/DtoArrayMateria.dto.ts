import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNotEmpty, ValidateNested } from "class-validator";
import { Materia } from "../entidad/Materia.entity";

export class DtoArrayMateria{
    @IsNotEmpty()
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(()=>Materia)
    materias:Materia[]
}