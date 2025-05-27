import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
  IsOptional,
} from 'class-validator';
export class CreateProjectDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsUUID('4', { message: 'Owner ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Owner ID is required' })
  ownerId: string;
}
