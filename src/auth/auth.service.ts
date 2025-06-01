import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const existingUser = await this.userService.findByEmail(
      registerUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    const newUser = await this.userService.create({
      email: registerUserDto.email,
      name: registerUserDto.name,
      password: hashedPassword,
    });
    const payload = { email: newUser.email, sub: newUser.id };
    const access_token = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = newUser;
    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    return {
      access_token,
      user,
    };
  }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.userService.findByEmailWithPassword(email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
