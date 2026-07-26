import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ReceiveDeviceDto {
  @ApiProperty({ example: 'C02XG0JHJGH7' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  receivedSerialNumber: string;

  @ApiPropertyOptional({ example: 'Box slightly damaged on arrival' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  notes?: string;
}
