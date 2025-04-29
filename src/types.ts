import { Request } from 'express';
import { JwtPayload } from './auth/interfaces/jwt.interface';

export type AppRequest = Request & { user: JwtPayload };
