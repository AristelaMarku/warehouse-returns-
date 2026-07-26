import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WarehouseUserEntity } from '../users/entities/warehouse-user.entity';
import { RmasService } from './rmas.service';
import { AuditService } from '../audit/audit.service';
import { RmaListQueryDto } from './dto/rma-list-query.dto';
import { ReceiveDeviceDto } from './dto/receive-device.dto';
import { PaginatedDto } from '../../common/pagination/paginated.dto';
import { RmaResponseDto } from './dto/rma-response.dto';
import { ReceiptResponseDto } from './dto/receipt-response.dto';

@ApiTags('rmas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rmas')
export class RmasController {
  constructor(
    private readonly rmasService: RmasService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List RMAs with optional status filter and search' })
  async findAll(@Query() query: RmaListQueryDto): Promise<PaginatedDto<RmaResponseDto>> {
    return this.rmasService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single RMA with receipt history' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<RmaResponseDto> {
    const rma = await this.rmasService.findOne(id);
    return RmaResponseDto.fromEntity(rma);
  }

  @Post(':id/receive')
  @ApiOperation({ summary: 'Receive a device against an RMA' })
  async receive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReceiveDeviceDto,
    @CurrentUser() actor: WarehouseUserEntity,
  ): Promise<ReceiptResponseDto> {
    return this.rmasService.receiveDevice(id, dto, actor);
  }

  @Patch(':id/cancel')
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Cancel an open RMA (supervisor+)' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: WarehouseUserEntity,
  ): Promise<RmaResponseDto> {
    return this.rmasService.cancel(id, actor);
  }

  @Patch(':id/extend-window')
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Extend eligibility window (supervisor+)' })
  async extendWindow(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('additionalDays', ParseIntPipe) additionalDays: number,
    @CurrentUser() actor: WarehouseUserEntity,
  ): Promise<RmaResponseDto> {
    return this.rmasService.extendWindow(id, additionalDays, actor);
  }

  @Get(':id/audit')
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Audit log for an RMA (supervisor+)' })
  async getAudit(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditService.findByEntityId(id);
  }
}
