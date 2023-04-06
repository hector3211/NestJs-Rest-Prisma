import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { UserService } from './user.service';
import { TaskService } from './task.service';
import { PrismaService } from './prisma.service';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TaskClass, UsersWithTasksClass } from './types';
import { HttpStatus } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({
          ttl: 1, // Use a shorter time window for testing (1 second)
          limit: 1, // Use a lower request limit for testing (1 request)
        }),
      ],
      controllers: [AppController],
      providers: [
        UserService,
        TaskService,
        PrismaService,
        AuthService,
        JwtService,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  // describe('root', () => {
  //   it('should return "Hello World!"', () => {
  //     expect(appController.getHello()).toBe('Hello World!');
  //   });
  // });
  //
  describe('Get all Users', () => {
    it('Should return a list of users cuz!', async () => {
      const result = new UsersWithTasksClass();
      expect(await appController.getAllUsers()).toMatchObject(result);
    });
  });

  describe('Get all Tasks', () => {
    it('Should return a list of Tasks cuz!', async () => {
      const result = new TaskClass();
      expect(await appController.getTasks()).toMatchObject(result);
    });
  });

  describe('Delete a User', () => {
    it('Should delete a specific User based on ID provided!', async () => {
      const userId: number = 3;
      expect(await appController.deleteUser(userId.toString())).toBe(204);
    });
  });
});
