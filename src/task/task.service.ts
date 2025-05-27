import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ProjectService } from 'src/project/project.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private readonly projectService: ProjectService,
    private readonly userService: UserService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const project = await this.projectService.findOne(createTaskDto.projectId);
    if (!project) {
      throw new BadRequestException(
        `Project with ID "${createTaskDto.projectId}" not found`,
      );
    }

    const assignedTo = await this.userService.findOne(
      createTaskDto.assignedToId,
    );
    if (!assignedTo) {
      throw new BadRequestException(
        `User with ID "${createTaskDto.assignedToId}" not found`,
      );
    }

    const newTask = this.tasksRepository.create({
      ...createTaskDto,
      project: project,
      assignedTo: assignedTo,
    });
    return this.tasksRepository.save(newTask);
  }

  findAll(): Promise<Task[]> {
    return this.tasksRepository.find({ relations: ['project', 'assignedTo'] });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['project', 'assignedTo'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (updateTaskDto.projectId) {
      const newProject = await this.projectService.findOne(
        updateTaskDto.projectId,
      );
      if (!newProject) {
        throw new BadRequestException(
          `New project with ID "${updateTaskDto.projectId}" not found`,
        );
      }
      task.project = newProject;
    }

    if (updateTaskDto.assignedToId) {
      const newAssignedTo = await this.userService.findOne(
        updateTaskDto.assignedToId,
      );
      if (!newAssignedTo) {
        throw new BadRequestException(
          `New assigned user with ID "${updateTaskDto.assignedToId}" not found`,
        );
      }
      task.assignedTo = newAssignedTo;
    }

    this.tasksRepository.merge(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const result = await this.tasksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }
}
