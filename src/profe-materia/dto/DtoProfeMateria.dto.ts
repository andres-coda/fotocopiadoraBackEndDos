import { Type } from "class-transformer";
import { IsEmpty, IsNotEmpty, ValidateNested } from "class-validator";
import { Curso } from "src/curso/entidad/Curso.entity";
import { Materia } from "src/materia/entidad/Materia.entity";
import { Persona } from "src/persona/entidad/Persona.entity";

export class DtoProfeMateria {
    @IsEmpty()
    @Type(()=>Persona)
    profesor: Persona;

    @IsEmpty()
    @Type(()=>Materia)
    materia: Materia;

    @IsNotEmpty()
    @Type(()=>Curso)
    curso: Curso;
}