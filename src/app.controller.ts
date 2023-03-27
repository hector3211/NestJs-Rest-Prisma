import {
    // BadRequestException,
    Body,
    // Catch,
    Controller,
    Delete,
    // ExceptionFilter,
    Get,
    HttpException,
    HttpStatus,
    InternalServerErrorException,
    // HttpException,
    // HttpStatus,
    NotFoundException,
    Param,
    Post,
    Put,
    // UseFilters,
} from '@nestjs/common';
// import { IsString, Matches } from 'class-validator';
// import { AppService } from './app.service';
import { UserService } from './user.service';
import { TaskService } from './task.service';
import { User as UserModal, Task as TaskModal } from '@prisma/client';

// class NameParam {
//   @IsString()
//   @Matches(/^[^0-9]*$/, {
//     message: 'Name should not contain any numbers',
//   })
//   name: string;
// }

// @Catch(Prisma.PrismaClientKnownRequestError)
// export class PrismaExceptionFilter implements ExceptionFilter {
//   catch(error: Prisma.PrismaClientKnownRequestError | null) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       throw new HttpException(
//         'Internal server error',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     } else if (error === null) {
//       throw new HttpException('Not found', HttpStatus.NOT_FOUND);
//     }
//   }
// }

@Controller()
export class AppController {
    constructor(
        private readonly userService: UserService,
        private readonly taskService: TaskService,
    ) { }

    // ---------------------------- Users
    @Get('allusers')
    async getAllUsers(): Promise<UserModal[] | null> {
        const query = await this.userService.getAllUsers();
        if (!query) {
            throw new NotFoundException(`Error getting all users!`);
        }

        return query;
    }

    @Get('user/:userEmail')
    // @UseFilters(PrismaExceptionFilter)
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
    @Get('getalltasks')
    async getTasks(): Promise<TaskModal[] | null> {
        const query = await this.taskService.getAllTasks();

        if (!query) {
            throw new NotFoundException(`Error getting all tasks!`);
        }

        return query;
    }

    @Get('gettask/:authId')
    async getTaskByUser(
        @Param('authId') authId: string,
    ): Promise<TaskModal[] | null> {
        const query = await this.taskService.getTaskByAuthor({
            authorId: Number(authId),
        });

        if (!query || query.length <= 0) {
            throw new NotFoundException(`Error No Tasks by that AuhtorID: ${authId}`);
        }

        return query;
    }

    @Post('task')
    async createTask(
        @Body() taskData: { content: string; completed: boolean; authorId: number },
    ): Promise<TaskModal | null> {
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

    @Delete('task/:id')
    async DeleteTask(@Param('id') id: string): Promise<HttpStatus | null> {
        const query = await this.taskService.deleteTask({
            id: Number(id),
        });

        if (!query) {
            throw new NotFoundException(`Error no task by ID: ${id}`);
        } else {
            return HttpStatus.NOT_FOUND;
        }
    }

    // @Get()
    // getHello(): string {
    //   return this.appService.getHello();
    // }
    //
    // @Get('sayname/:name')
    // sayName(@Param(ValidationPipe) params: NameParam): string {
    //   return this.appService.sayHello(params.name);
    // }

    //     @Get()
    // async findAll() {
    //   try {
    //     await this.service.findAll()
    //   } catch (error) {
    //     throw new HttpException({
    //       status: HttpStatus.FORBIDDEN,
    //       error: 'This is a custom message',
    //     }, HttpStatus.FORBIDDEN, {
    //       cause: error
    //     });
    //   }
    // }
}
