import { DefaultSession } from "next-auth";
import { database } from "@/lib/database";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: database.Role.USER | database.Role.ADMIN;
    } & DefaultSession["user"];
  }
  interface User {
    role: string;
  }
}
