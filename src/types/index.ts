import { InferSelectModel } from "drizzle-orm";
import { User } from "../db/schema";

export type UserType = InferSelectModel<typeof User>;

export interface RegisterUserInput {
  name: string;
  age: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
} 