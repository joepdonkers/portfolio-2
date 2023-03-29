import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { TokenMiddleware } from './auth/token.middleware';
import { CategoryController } from './category/category.controller';
import { ContractController } from './contract/contract.controller';
import { DataModule } from './data.module';
import { FieldController } from './field/field.controller';
import { OrganisationController } from './organisation/organisation.controller';
import { TemplateController } from './template/template.controller';
import { UserController } from './user/user.controller';

@Module({
	imports: [
		MongooseModule.forRoot(
			`mongodb://localhost:27017/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`,
		),
		AuthModule,
		DataModule,
		RouterModule.register([
			{
				path: 'auth',
				module: AuthModule,
			},
			{
				path: 'data',
				module: DataModule,
			},
		]),
	],
	controllers: [UserController, CategoryController, ContractController, FieldController, OrganisationController, TemplateController],
	providers: [],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(TokenMiddleware)
			.exclude({ path: 'api/auth/login', method: RequestMethod.POST },{ path: 'api/auth/register', method: RequestMethod.POST })
			.forRoutes('*');
	}
}
