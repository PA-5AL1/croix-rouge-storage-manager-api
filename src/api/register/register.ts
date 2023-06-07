import { Handler, HandlerContext, HandlerEvent } from '@netlify/functions'
import { registerUser } from '../../application/registerUser';
import { InMemoryUserRepository } from '../../infrastructure/inMemoryUserRepository';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { ErrorResponse, Response, response } from '../response';
import { HashPassword } from '../../domain/user/hashPassword';
import { Users } from '../../domain/user/users';
import { BCryptHash } from '../../infrastructure/bCryptHash';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (!event.body) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      body: response({
        code: StatusCodes.BAD_REQUEST,
        message: "Missing body, the following fields are required : email and password.",
        error : ReasonPhrases.BAD_REQUEST,
      }),
    }
  }

  const body = JSON.parse(event.body);

  const users : Users = InMemoryUserRepository;
  const hashService: HashPassword = BCryptHash;
  
  const register = registerUser(users, hashService);
  const newUser : RegisterUserDto = {
    email: body.email,
    password: body.password,
  }

  register(newUser)
    .catch((error: Error) => {
      return {
          statusCode: StatusCodes.UNAUTHORIZED,
          body: response({
            code: StatusCodes.UNAUTHORIZED,
            message : "User already registered.",
              error : error.message,
          }),
        }
    });

  return {
    statusCode: StatusCodes.OK,
    body: response({
      code: StatusCodes.OK,
      message: "User registered successfully.",
    }),
  }
}

