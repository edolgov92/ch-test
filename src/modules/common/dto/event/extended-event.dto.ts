import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { BaseEventDto } from './base-event.dto';

export class ExtendedEventDto extends BaseEventDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  @ApiProperty()
  brand: string;
}
