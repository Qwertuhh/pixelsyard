import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcrypt";

// const database = new PrismaClient();
// const database = new PrismaClient().$extends({
//   query: {
//     user: {
//       async update({ model, operation, args, query }) {
//         console.log("Modifying update query...");
//         console.log("Model:", model);
//         console.log("Operation:", operation);
//         console.log("Args:", args);
//         console.log("Query:", query);
//         return query(args);
//       },
//     },
//   },
// });

const database = new PrismaClient().$extends({
  query: {
    user: {
      async create({ args, query }) {
        if (args.data.password) {
          const salt = await bcrypt.genSalt(10);
          args.data.password = await bcrypt.hash(args.data.password, salt);
        }
        return query(args);
      },
    },
    imageVariant: {
      async create({ args, query }) {
        if (args.data.price) {
          if (typeof args.data.price !== "number") {
            args.data.price = Number(args.data.price);
          }
          if (args.data.price < 0) {
            throw new Error("Price cannot be negative");
          }
        }
        return query(args);
      },
    },
  },
});
// Wrapper for database operations
async function callDB<T>(
  fn: (db: typeof database) => Promise<T>
): Promise<T | void> {
  try {
    const result = await fn(database);
    console.log("Result from database operation:", result);
    return result;
  } catch (error) {
    console.error("Error during database operation:", error);
  }
}

export { database, callDB };
