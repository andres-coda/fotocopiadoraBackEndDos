import { Type } from "class-transformer";
import { IsEmpty, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";
import { Escuela } from "src/escuela/entidad/Escuela.entity";
import { Materia } from "src/materia/entidad/Materia.entity";
import { Persona } from "src/persona/entidad/Persona.entity";

export class DtoCurso {
    @IsEmpty()
    @IsNumber()
    idCurso?:number;

    @IsNotEmpty()
    @IsNumber()
    anio: number;

    @IsNotEmpty()
    @IsString()
    grado: string;

    @IsNotEmpty()
    @Type(() => Escuela)
    escuela: Escuela;   
}