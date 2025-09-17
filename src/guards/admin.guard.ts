import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { configService } from '../config/config.service';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateAdmin(request);
  }

  private validateAdmin(request: any): boolean {
    const admins = configService.getAdmins();

    // Get currentUser from cookies
    const currentUser = request.cookies?.currentUser;

    if (!currentUser) {
      return false;
    }

    // Check if current user is in admins array
    return admins.includes(currentUser);
  }
}
