import {
	Body,
	Controller,
	HttpException,
	HttpStatus,
	Param,
	Post,
	Put,
	UseGuards,
} from '@nestjs/common';
import { RolesGuard } from 'src/roles/roles.guard';

import {
	UserRegistration,
	UserCredentials,
	TokenString,
	ResourceId,
	IdentityModel,
} from '../models/auth.model';
import { User } from '../user/user.schema';

import { AuthService } from './auth.service';
import { InjectToken, Token } from './token.decorator';

@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async register(@Body() newUser: UserRegistration): Promise<ResourceId> {
		let identityUser = null;

		// RegEx om te controleren of het wachtwoord minimaal 8 tekens, een hoofdletter, een cijfer en een speciaal teken bevat
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

		// Controleer of het wachtwoord aan de complexiteitseis voldoet
		if (!passwordRegex.test(newUser.password)) {
			throw new HttpException(
				'Password needs to be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
				HttpStatus.BAD_REQUEST,
			);
		}
		try {
			identityUser = await this.authService.registerUser(
				newUser.email,
				newUser.password,
			);
			return {
				id: await this.authService.createUser(
					identityUser.id,
					newUser.name,
					newUser.email,
					newUser.jobTitle,
					//newUser.role,
					newUser.organisations,
				),
			};
		} catch (e) {
			console.log(e);

			if (identityUser != null) {
				await this.authService.deleteIdentity(identityUser.id);
			}

			if (e.message == 'Email is already in use') {
				throw new HttpException(
					'Email is already in use',
					HttpStatus.BAD_REQUEST,
				);
			}

			throw new HttpException('Invalid input', HttpStatus.BAD_REQUEST);
		}
	}

	@Put('editIdentity')
	async editUser(
		@InjectToken() token: Token,
		@Body() identity: IdentityModel,
	) {
		return this.authService.editUser(token.id, identity);
	}

	@Put(':id')
	@UseGuards(RolesGuard)
	async editUserById(@Param('id') userId: string, @Body() userInfo: UserRegistration): Promise<User> {
		let identityUser = null;
		try {
			identityUser = await this.authService.editUser(userId, userInfo);

			return await this.authService.editUserInfo(
					userId,
					userInfo.name,
					userInfo.email,
					userInfo.jobTitle,
					userInfo.role,
					userInfo.organisations
				);
		} catch (e) {
			console.log(e);

			if (identityUser != null) {
				await this.authService.deleteIdentity(identityUser.id);
			}

			if (e.message == 'Email is already in use') {
				throw new HttpException(
					'Email is already in use',
					HttpStatus.BAD_REQUEST,
				);
			}

			throw new HttpException('Invalid input', HttpStatus.BAD_REQUEST);
		}
	}

	@Post('login')
	async login(@Body() credentials: UserCredentials): Promise<TokenString> {
		try {
			return {
				token: await this.authService.generateToken(
					credentials.email,
					credentials.password,
				),
			};
		} catch (e) {
			console.log(e);
			throw new HttpException(
				'Invalid credentials',
				HttpStatus.UNAUTHORIZED,
			);
		}
	}
}
