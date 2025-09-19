import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { CustomHeaders } from '../../decorators';
import { HostPipe } from '../../pipes/host.pipe';
import { MessageInDto } from '../../dto/message-in.dto';
import { MessageOutDto } from '../../dto/message-out.dto';
import { HistoryOutDto } from '../../dto/history-out.dto';
import { AssistantControllerDoc } from './assistant.controller.doc';
import { Cookies } from '../../decorators/cookie.decorator';

@Controller()
@AssistantControllerDoc.main()
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post()
  @AssistantControllerDoc.writeMessage()
  writeMessage(
    @CustomHeaders(new HostPipe())
    host: string,
    @Body() body: MessageInDto,
    @Cookies('currentUser') currentUser?: string,
  ): Promise<MessageOutDto> {
    return this.assistantService.writeMessage({ ...body, currentUser, host });
  }

  @Get('history/:id')
  @AssistantControllerDoc.getHistory()
  getHistory(
    @Param('id')
    id: string,
  ): Promise<HistoryOutDto> {
    return this.assistantService.getHistory(id);
  }
}
