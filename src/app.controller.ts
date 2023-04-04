import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Logger,
  UseGuards,
  UnauthorizedException,
  Res,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { TaskService } from './task.service';
import { User as UserModal, Task as TaskModal } from '@prisma/client';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from './auth/auth.guard';
import { Request, Response } from 'express';
import { MyThrottlerGuard } from './throttle.guard';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { TaskSchema, UserSchema } from './swaggerSchemas/schemas';

@Controller()
@UseGuards(MyThrottlerGuard)
export class AppController {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly taskService: TaskService,
    private readonly authService: AuthService,
  ) {}

  // ---------------------------- Authentication
  @Post('auth/login/:userEmail')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Param('userEmail') email: string,
  ) {
    // this.logger.debug(`Secret key-- ${jwtConstants.secret}`);
    if (email) {
      response.cookie('authenticated', true);
    }
    return await this.authService.signIn(email);
  }

  // ---------------------------- Users
  @Get('users')
  async getAllUsers(@Req() req: Request): Promise<UserModal[] | null> {
    const token = req.cookies['authenticated'];
    if (!token) {
      throw new UnauthorizedException('Token Error! Not Correct token');
    }

    const query = await this.userService.getAllUsers();
    if (!query) {
      throw new NotFoundException(`Error getting all users!`);
    }

    return query;
  }

  @Get('user/:userEmail')
  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard)
  async getUser(
    @Param('userEmail') userEmail: string,
  ): Promise<UserModal | null> {
    const query = await this.userService.getUser({ email: userEmail });

    if (!query) {
      throw new NotFoundException(
        `Error querying for user: ${userEmail}, please check for correct spelling!`,
      );
    }

    return query;
  }

  @Post('user')
  @ApiBody({
    type: UserSchema,
    description: `Please fill out in JSON format "name" and "email"`,
  })
  async createUser(
    @Body() userData: { email: string; name: string },
  ): Promise<UserModal | null> {
    const query = await this.userService.createUser(userData);

    if (!query) {
      throw new NotFoundException(`Error creating new User!`);
    }

    return query;
  }

  @Put('user')
  async updateUser(
    @Body() updateData: { where: { id: number }; data: { email: string } },
  ): Promise<UserModal | null> {
    const query = await this.userService.updateUser(updateData);

    if (!query) {
      throw new NotFoundException('No User found with that id!');
    }

    return query;
  }

  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard)
  @Delete('user/:userId')
  async deleteUser(
    @Param('userId') userId: string,
  ): Promise<HttpStatus | null> {
    const query = await this.userService.deleteUser({
      id: Number(userId),
    });

    if (!query) {
      throw new NotFoundException(`No User found with that ID: ${userId}`);
    } else {
      return HttpStatus.NO_CONTENT;
    }
  }

  // ---------------------------- Tasks
  @Get('tasks')
  async getTasks(): Promise<TaskModal[] | null> {
    const query = await this.taskService.getAllTasks();

    if (!query) {
      throw new NotFoundException(`Error getting all tasks!`);
    }

    return query;
  }

  @Get('task/:authorId')
  async getTaskByUser(
    @Param('authorId') authorId: string,
  ): Promise<TaskModal[] | null> {
    const query = await this.taskService.getTaskByAuthor({
      authorId: Number(authorId),
    });

    if (!query || query.length <= 0) {
      throw new NotFoundException(
        `Error No Tasks by that AuhtorID: ${authorId}`,
      );
    }

    return query;
  }

  @Post('task')
  @ApiBody({
    type: TaskSchema,
    description: `Please fill out in JSON format "content", "completed", and "authorId"`,
  })
  async createTask(@Body() taskData: TaskSchema): Promise<TaskModal | null> {
    const { content, completed, authorId } = taskData;
    const query = await this.taskService.createTask({
      content,
      completed,
      author: {
        connect: { id: authorId },
      },
    });

    if (!query) {
      throw new InternalServerErrorException(`Error in createTask function!`);
    }

    return query;
  }

  @Put('task')
  async updateTask(
    @Body()
    updateData: {
      where: { id: number };
      data: { content?: string; completed: boolean };
    },
  ): Promise<TaskModal | null> {
    const query = await this.taskService.updateTask(updateData);

    if (!query) {
      throw new InternalServerErrorException(
        `Error updated task: ${updateData.where.id}`,
      );
    }

    return query;
  }

  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard)
  @Delete('task/:taskId')
  async DeleteTask(
    @Param('taskId') taskId: string,
  ): Promise<HttpStatus | null> {
    const query = await this.taskService.deleteTask({
      id: Number(taskId),
    });

    if (!query) {
      throw new NotFoundException(`Error no task by ID: ${taskId}`);
    } else {
      return HttpStatus.NO_CONTENT;
    }
  }
}
