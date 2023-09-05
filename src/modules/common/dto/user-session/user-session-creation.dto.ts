import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { AbstractDto } from '../abstract';

export class UserSessionCreationDto extends AbstractDto<UserSessionCreationDto> {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty()
  authId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @ApiProperty()
  secret: string;
}
