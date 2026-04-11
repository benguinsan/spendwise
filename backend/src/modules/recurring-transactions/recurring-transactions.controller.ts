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
import { RecurringTransactionsService } from './recurring-transactions.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';

@Controller('recurring-transactions')
export class RecurringTransactionsController {
  constructor(
    private readonly recurringTransactionsService: RecurringTransactionsService,
  ) {}

  @Post()
  create(@Body() createRecurringTransactionDto: CreateRecurringTransactionDto) {
    return this.recurringTransactionsService.create(
      createRecurringTransactionDto,
    );
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
    return this.recurringTransactionsService.findAll(userId, skip, take);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.recurringTransactionsService.findOne(id, userId);
  }

  @Get(':id/next-executions')
  getNextExecutions(
    @Param('id') id: string,
    @Query('userId') userId?: string,
    @Query('count', new DefaultValuePipe(5), ParseIntPipe) count?: number,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.recurringTransactionsService.getNextExecutions(
      id,
      userId,
      count,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('userId') userId?: string,
    @Body() updateRecurringTransactionDto?: UpdateRecurringTransactionDto,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.recurringTransactionsService.update(
      id,
      userId,
      updateRecurringTransactionDto,
    );
  }

  @Patch(':id/toggle')
  toggleActive(
    @Param('id') id: string,
    @Query('userId') userId?: string,
    @Body() body?: { isActive: boolean },
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    if (body?.isActive === undefined) {
      throw new BadRequestException('isActive is required in body');
    }
    return this.recurringTransactionsService.toggleActive(
      id,
      userId,
      body.isActive,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.recurringTransactionsService.delete(id, userId);
  }
}
