export class UsersWithTasksClass {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  tasks?: TaskClass[];
}

export class TaskClass {
  id: number;
  content: string;
  completed: boolean;
  authorId: number;
}
