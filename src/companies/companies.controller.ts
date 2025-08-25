import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { Company } from '../../db/models/Company';

interface NewCompanyDto {
  name: string;
}

interface CompanyDto {
  id: number;
  name: string;
}

@Controller('api/v1/companies')
export class CompaniesController {
  @Get()
  async findAll() {
    return await Company.findAll();
  }

  @Post()
  async create(@Body() newCompanyDto: NewCompanyDto) {
    const company = await Company.create(newCompanyDto);
    const companyDto: CompanyDto = {
      id: company.id,
      name: company.name,
    };

    return companyDto;
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    const company = await Company.findByPk(id);
    if (!company)
      throw new NotFoundException(`Company with id ${id} not found`);

    await company.destroy();
    return { message: 'Company deleted successfully' };
  }
}
