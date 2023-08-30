import { User } from "@prisma/client";

export class UserDto implements User {
  id!: string;
  color!: string;

  constructor(data: User) {
    Object.assign(this, data);
  }

  static fromUser(user: User): UserDto {
    return new UserDto({
      id: user.id,
      color: user.color,
    });
  }
}
