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
  private readonly adminRole = process.env.MAIN_ROLE;
  private readonly adminEmail = process.env.MAIN_EMAIL;
  private readonly adminName = process.env.MAIN_NAME;
  constructor(
    private readonly userService: UserService,
    private readonly taskService: TaskService,
    private readonly authService: AuthService,
  ) {}

  // ---------------------------- Authentication
  @Post('auth/signup/:userName/:userEmail')
  async signUp(
    @Res({ passthrough: true }) response: Response,
    @Param('userEmail') userEmail: string,
    @Param('userName') userName: string,
  ) {
    let currRole;
    if (userEmail === this.adminEmail && userName === this.adminName) {
      currRole = this.adminRole;
    } else {
      currRole = 'User';
    }
    response.cookie('Role', currRole);
    const userData = {
      email: userEmail,
      name: userName,
      role: currRole,
    };
    return await this.userService.createUser(userData);
  }

  @Post('auth/login/:userEmail')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Param('userEmail') email: string,
  ) {
    // this.logger.debug(`Secret key-- ${jwtConstants.secret}`);
    if (email) {
      response.cookie('authenticated', true);
    }
    // NEED REFORMAT THIS CUZ IT LOOKS BAD!!!!!!!!!!!!!!!
    const query = this.userService
      .getUser({ email: email })
      .then((resp) => {
        const currRole = resp?.role;
        response.cookie('Role', currRole);
      })
      .catch((error) => {
        throw new NotFoundException(error);
      });

    return await this.authService.signIn(email);
  }

  // ---------------------------- Users
  @Get('users')
  async getAllUsers(): Promise<UserModal[] | null> {
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
    @Req() request: Request,
  ): Promise<UserModal | null> {
    if (request.cookies['Role'] === this.adminRole) {
      const query = await this.userService.getUser({ email: userEmail });
      if (!query) {
        throw new NotFoundException(
          `Error querying for user: ${userEmail}, please check for correct spelling!`,
        );
      }

      return query;
    } else {
      throw new UnauthorizedException();
    }
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
