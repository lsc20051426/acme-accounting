import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { User, UserRole } from '../../db/models/User';

interface NewUserDto {
  name: string;
  role: UserRole;
  companyId: number;
}

interface UserDto {
  id: number;
  name: string;
  role: UserRole;
  companyId: number;
}

@Controller('api/v1/users')
export class UsersController {
  @Get()
  async findAll(@Query('companyId') companyId?: string) {
    const where = companyId ? { companyId: Number(companyId) } : {};
    return await User.findAll({ where });
  }

  @Post()
  async create(@Body() newUserDto: NewUserDto) {
    const user = await User.create({
      name: newUserDto.name,
      role: newUserDto.role,
      companyId: newUserDto.companyId,
    });
    const userDto: UserDto = {
      id: user.id,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    };

    return userDto;
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    const user = await User.findByPk(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    await user.destroy();
    return { message: 'User deleted successfully' };
  }
}
