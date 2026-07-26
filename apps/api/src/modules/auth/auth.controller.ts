import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WarehouseUserEntity } from '../users/entities/warehouse-user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with username and password' })
  async login(@Body() dto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.authService.validateUser(dto.username, dto.password);
    return this.authService.login(user);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  me(@CurrentUser() user: WarehouseUserEntity): UserResponseDto {
    return UserResponseDto.fromEntity(user);
  }
}
