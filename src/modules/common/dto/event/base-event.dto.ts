import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { AbstractDto } from '../abstract';

export class BaseEventDto extends AbstractDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @IsUUID(4)
  @ApiProperty()
  id: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  @ApiProperty()
  name: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  @ApiProperty()
  body: string;

  @Expose()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  timestamp: Date;
}
