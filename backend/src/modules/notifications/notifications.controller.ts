import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take?: number,
    @Query('isRead') isRead?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    const isReadBoolean = isRead ? isRead === 'true' : undefined;
    return this.notificationsService.findAll(userId, skip, take, isReadBoolean);
  }

  @Get('summary/:userId')
  getSummary(@Param('userId') userId: string) {
    return this.notificationsService.getSummary(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.notificationsService.findOne(id, userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('batch/read-all')
  markAllAsRead(@Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.notificationsService.delete(id, userId);
  }

  @Delete()
  deleteAll(@Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.notificationsService.deleteAll(userId);
  }
}
