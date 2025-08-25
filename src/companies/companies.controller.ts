import { Body, Controller, Get, Post } from '@nestjs/common';
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
}
