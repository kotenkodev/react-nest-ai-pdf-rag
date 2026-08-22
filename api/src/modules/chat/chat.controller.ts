import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { EmailGuard } from 'src/shared/guards/email.guard';
import { CurrentUserEmail } from 'src/shared/decorators/current-user-email.decorator';

@Controller('chat')
@UseGuards(EmailGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  public async ask(
    @CurrentUserEmail() email: string,
    @Body() data: AskQuestionDto,
  ) {
    return this.chatService.answerQuestion(email, data);
  }
}
