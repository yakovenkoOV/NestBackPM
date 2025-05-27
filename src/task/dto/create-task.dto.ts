import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Invalid task status' })
  status?: TaskStatus;

  @IsUUID('4', { message: 'Project ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Project ID is required' })
  projectId: string;

  @IsUUID('4', { message: 'Assigned To ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Assigned To ID is required' })
  assignedToId: string;
}
