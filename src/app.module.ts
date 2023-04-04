import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserService } from './user.service';
import { TaskService } from './task.service';
import { PrismaService } from './prisma.service';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';
import { PassportModule } from '@nestjs/passport';
import * as dotenv from 'dotenv';
import { ThrottlerModule } from '@nestjs/throttler';
dotenv.config();

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        global: true,
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '1d' },
      }),
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        ttl: 60,
        limit: 10,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [UserService, TaskService, PrismaService, AuthService, JwtService],
})
export class AppModule {}
