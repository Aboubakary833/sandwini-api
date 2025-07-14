import vine from '@vinejs/vine';
import { Database } from '@adonisjs/lucid/database';

const Exist = async (db: Database, value: string) => {
  const user = await db.from('users').where('email', value).first();
  return user !== null;
}

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().exists(Exist),
    password: vine.string(),
  })
);

export const twoFactorValidator = vine.compile(
  vine.object({
    email: vine.string().email().exists(Exist),
    otp: vine.string().fixedLength(6),
  })
)
