import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CustomHeaders } from './decorators';
import { HostPipe } from './pipes/host.pipe';
import { MessageInDto } from './dto/message-in.dto';
import { MessageOutDto } from './dto/message-out.dto';
import { HistoryOutDto } from './dto/history-out.dto';
import { AppControllerDoc } from './app.controller.doc';
import { cleanNode } from './assistant/nodes/cleangirl';

@Controller()
@AppControllerDoc.main()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @AppControllerDoc.writeMessage()
  writeMessage(
    @CustomHeaders(new HostPipe())
    host: string,
    @Body() body: MessageInDto,
  ): Promise<MessageOutDto> {
    return this.appService.writeMessage({ ...body, host });
  }

  @Get('history/:id')
  @AppControllerDoc.getHistory()
  getHistory(
    @Param('id')
    id: string,
  ): Promise<HistoryOutDto> {
    return this.appService.getHistory(id);
  }

  @Post('clean')
  cleanMessage(
    @CustomHeaders(new HostPipe())
    host: string,
    @Body() body: MessageInDto,
  ) {
    return cleanNode(body.query);
  }
}
