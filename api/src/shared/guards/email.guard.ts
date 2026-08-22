import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithUser } from '../types/request.types';

@Injectable()
export class EmailGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const emailHeader = request.headers['x-user-email'] as string;

    if (!emailHeader) {
      throw new UnauthorizedException('x-user-email header is required');
    }

    request.email = emailHeader;

    return true;
  }
}
