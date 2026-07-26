import { ApiProperty } from '@nestjs/swagger';
import { WarehouseUserEntity } from '../entities/warehouse-user.entity';

export class UserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() username: string;
  @ApiProperty() displayName: string;
  @ApiProperty() email: string;
  @ApiProperty() role: string;

  static fromEntity(user: WarehouseUserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.username = user.username;
    dto.displayName = user.displayName;
    dto.email = user.email;
    dto.role = user.role;
    return dto;
  }
}
