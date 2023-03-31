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
dotenv.config();

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        global: true,
        secret: jwtConstants.secret || 'secret-key',
        // secretOrPrivateKey: process.env.JWT_SECRET || 'secret-key',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [UserService, TaskService, PrismaService, AuthService, JwtService],
})
export class AppModule {}
