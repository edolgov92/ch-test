import { AbstractDto } from '../abstract';

export class UserTokenContextDto extends AbstractDto<UserTokenContextDto> {
  id: string;
  authId: string;
}
