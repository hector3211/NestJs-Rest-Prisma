import { ApiProperty } from '@nestjs/swagger';

export class TaskSchema {
  @ApiProperty()
  readonly content: string;
  @ApiProperty()
  readonly completed: boolean;
  @ApiProperty()
  readonly authorId: number;
}

export class UserSchema {
  @ApiProperty()
  readonly name: string;
  @ApiProperty()
  readonly email: string;
}
