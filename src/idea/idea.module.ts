import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IdeaController } from './idea.controller';
import { IdeaService } from './idea.service';
import { IdeaEntity } from './idea.entity';
import { UserEntity } from '../user/user.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../shared/auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([IdeaEntity, UserEntity])],
  controllers: [IdeaController],
  providers: [IdeaService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ]
})
export class IdeaModule {}
