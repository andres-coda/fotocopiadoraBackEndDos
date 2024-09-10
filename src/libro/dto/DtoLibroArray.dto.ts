import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNotEmpty, ValidateNested } from "class-validator";
import { Libro } from "../entidad/libro.entity";

export class DtoLibroArray { 
    @IsNotEmpty()    
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({each:true})
    @Type(()=>Libro)
    libros:Libro[];
}