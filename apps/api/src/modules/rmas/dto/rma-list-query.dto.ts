import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { RmaStatus } from '@warehouse/shared';
import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto';

export type RmaStatusFilter = RmaStatus | 'ACTIVE';

export class RmaListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: [...Object.values(RmaStatus), 'ACTIVE'] })
  @IsOptional()
  @IsIn([...Object.values(RmaStatus), 'ACTIVE'])
  status?: RmaStatusFilter;

  @ApiPropertyOptional({ description: 'Search by RMA number, customer name, device model, or serial' })
  @IsOptional()
  @IsString()
  search?: string;
}
