import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { AbstractDto } from '../abstract';

export class UserSessionRefreshDto extends AbstractDto<UserSessionRefreshDto> {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @Length(256)
  @ApiProperty()
  refreshToken: string;
}
