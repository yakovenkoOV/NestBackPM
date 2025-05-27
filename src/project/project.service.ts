import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private readonly userService: UserService,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const owner = await this.userService.findOne(createProjectDto.ownerId);
    if (!owner) {
      throw new BadRequestException(
        `User with ID "${createProjectDto.ownerId}" not found`,
      );
    }

    const newProject = this.projectsRepository.create({
      ...createProjectDto,
      owner: owner,
    });
    return this.projectsRepository.save(newProject);
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find({ relations: ['owner'] });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.findOne(id);

    if (updateProjectDto.ownerId) {
      const newOwner = await this.userService.findOne(updateProjectDto.ownerId);
      if (!newOwner) {
        throw new BadRequestException(
          `New owner user with ID "${updateProjectDto.ownerId}" not found`,
        );
      }
      project.owner = newOwner;
    }

    this.projectsRepository.merge(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
  }
}
