import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RmaStatus } from '@warehouse/shared';
import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto';

export class RmaListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: RmaStatus, default: RmaStatus.OPEN })
  @IsOptional()
  @IsEnum(RmaStatus)
  status?: RmaStatus = RmaStatus.OPEN;

  @ApiPropertyOptional({ description: 'Search by RMA number, customer name, device model, or serial' })
  @IsOptional()
  @IsString()
  search?: string;
}
