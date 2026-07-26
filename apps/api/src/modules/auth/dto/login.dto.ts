import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'receiver1' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'recv123' })
  @IsString()
  @MinLength(1)
  password: string;
}
