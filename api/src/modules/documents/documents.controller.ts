import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { EmailGuard } from 'src/shared/guards/email.guard';
import { CurrentUserEmail } from 'src/shared/decorators/current-user-email.decorator';
import { SetDocumentStatusDto } from './dto/set-document-status.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @UseGuards(EmailGuard)
  public async getDocumentByEmail(@CurrentUserEmail() email: string) {
    return this.documentsService.getDocumentByEmail(email);
  }

  @Get('status')
  @UseGuards(EmailGuard)
  public async getDocumentStatus(@CurrentUserEmail() email: string) {
    return this.documentsService.getDocumentStatus(email);
  }

  @Get('download')
  @UseGuards(EmailGuard)
  public async getDownloadUrl(@CurrentUserEmail() email: string) {
    const downloadUrl = await this.documentsService.getDownloadUrl(email);
    return { downloadUrl };
  }

  @Post()
  @UseGuards(EmailGuard)
  public async createDocument(
    @CurrentUserEmail() email: string,
    @Body() data: CreateDocumentDto,
  ) {
    return this.documentsService.createDocument(email, data);
  }

  @Post('set-status')
  public async setStatus(@Body() documentDto: SetDocumentStatusDto) {
    return this.documentsService.setStatus(documentDto);
  }

  @Delete()
  @UseGuards(EmailGuard)
  public async deleteDocument(@CurrentUserEmail() email: string) {
    const success = await this.documentsService.deleteDocument(email);
    return { success };
  }
}
