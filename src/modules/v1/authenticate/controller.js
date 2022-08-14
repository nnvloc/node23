import bcrypt from 'bcrypt';
import { UserService, AuthService } from '@services';
import { sendResponse } from '@utils/response';

class AuthnticateController {
  async signUp(req, res, next) {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      throw new Error('Missing required params');
    }

    const existedUser = await UserService.getUserByEmail(email);

    if (existedUser) {
      throw new Error('Email already used');
    }

    const cryptedPassword = await bcrypt.hash(password.toString(), 10);
    const createdUser = await UserService.createUser({
      email,
      full_name,
      password: cryptedPassword,
    });

    return sendResponse(res, {user: createdUser});
  }

  async login(req, res, next) {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      throw new Error('Missing required params');
    }

    const existedUser = await UserService.getUserByEmail(email);

    if (!existedUser) {
      throw new Error("Wrong username or password");
    }

    const isValidPassword = existedUser.isValidPassword(password);

    if (!isValidPassword) {
      throw new Error('Wrong username or password');
    }

    const jwtToken = AuthService.generateJWTToken({
      id: existedUser.id,
      full_name: existedUser.full_name,
    });

    return sendResponse(res, {user: existedUser, token: jwtToken});
  }
}

export default new AuthnticateController();
