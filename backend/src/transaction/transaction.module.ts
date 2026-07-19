import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { AuthModule } from 'src/auth/auth.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [AuthModule, EmailModule],
  controllers: [TransactionController],
  providers: [TransactionService]
})
export class TransactionModule {}
