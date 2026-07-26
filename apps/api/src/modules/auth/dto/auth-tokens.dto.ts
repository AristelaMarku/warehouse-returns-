import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthTokensDto {
  @ApiProperty() accessToken: string;
  @ApiProperty() user: UserResponseDto;
}
