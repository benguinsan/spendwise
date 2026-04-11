import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(@Body() createGoalDto: CreateGoalDto) {
    return this.goalsService.create(createGoalDto);
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take?: number,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.goalsService.findAll(userId, skip, take);
  }

  @Get('summary/:userId')
  getSummary(@Param('userId') userId: string) {
    return this.goalsService.getGoalsSummary(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.goalsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('userId') userId?: string,
    @Body() updateGoalDto?: UpdateGoalDto,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.goalsService.update(id, userId, updateGoalDto);
  }

  @Post(':id/progress')
  addProgress(
    @Param('id') id: string,
    @Query('userId') userId?: string,
    @Body() body?: { amount: number },
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    if (!body?.amount) {
      throw new BadRequestException('amount is required in body');
    }
    return this.goalsService.addProgress(id, userId, body.amount);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.goalsService.delete(id, userId);
  }
}
