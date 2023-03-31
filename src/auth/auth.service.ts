import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string): Promise<any> {
    const user = await this.userService.getUser({ email: email });
    if (!user?.role) {
      throw new UnauthorizedException();
    }
    // const { role, ...result } = user;
    // TODO: Generate a JWT and return it here
    // instead of the user object
    const payload = { username: user.name, sub: user.id };
    this.logger.debug(
      `Users Email: ${user.email}, Here is the role: ${user.role}`,
    );
    // return result;
    // THIS WORKS SOMEHOW
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: `${process.env.JWT_SECRET}`,
      }),
    };
  }
}
