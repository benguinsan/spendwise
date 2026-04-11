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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take?: number,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.tagsService.findAll(userId, skip, take);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.tagsService.findOne(id, userId);
  }

  @Get(':id/transactions')
  getTagTransactions(
    @Param('id') id: string,
    @Query('userId') userId?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take?: number,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.tagsService.getTagTransactions(id, userId, skip, take);
  }

  @Get(':id/analytics')
  getAnalytics(@Param('id') id: string, @Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.tagsService.getTagAnalytics(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('userId') userId?: string,
    @Body() updateTagDto?: UpdateTagDto,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.tagsService.update(id, userId, updateTagDto);
  }

  @Post(':id/transactions/:transactionId')
  addTagToTransaction(
    @Param('id') tagId: string,
    @Param('transactionId') transactionId: string,
    @Query('userId') userId?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.tagsService.addTagToTransaction(transactionId, tagId, userId);
  }

  @Delete(':id/transactions/:transactionId')
  removeTagFromTransaction(
    @Param('id') tagId: string,
    @Param('transactionId') transactionId: string,
    @Query('userId') userId?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.tagsService.removeTagFromTransaction(
      transactionId,
      tagId,
      userId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.tagsService.delete(id, userId);
  }
}
