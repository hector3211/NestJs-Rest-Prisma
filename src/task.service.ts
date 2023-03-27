import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Task, Prisma } from '@prisma/client';
import { LazyModuleLoader } from '@nestjs/core';

@Injectable()
export class TaskService {
    constructor(
        private prisma: PrismaService,
        private lazyModuleLoader: LazyModuleLoader,
    ) { }

    async getTaskByAuthor(where: Prisma.TaskWhereInput): Promise<Task[] | null> {
        return this.prisma.task.findMany({
            where,
        });
    }

    async getAllTasks(): Promise<Task[] | null> {
        return this.prisma.task.findMany();
    }

    async createTask(data: Prisma.TaskCreateInput): Promise<Task | null> {
        return this.prisma.task.create({
            data,
        });
    }

    async updateTask(params: {
        where: Prisma.TaskWhereUniqueInput;
        data: Prisma.TaskUpdateInput;
    }): Promise<Task | null> {
        const { data, where } = params;
        return this.prisma.task.update({
            where,
            data,
        });
    }

    async deleteTask(where: Prisma.TaskWhereUniqueInput): Promise<Task | null> {
        return this.prisma.task.delete({
            where,
        });
    }
}
