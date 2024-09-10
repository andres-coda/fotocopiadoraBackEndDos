import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNotEmpty, ValidateNested } from "class-validator";
import { Curso } from "src/curso/entidad/Curso.entity";

export class DtoAgregarCurso{
    @IsNotEmpty()
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => Curso)
    cursos:Curso[];
}