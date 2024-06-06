import express, { NextFunction, Request, Response } from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updatedUser,
} from "../controllers/userController";

const JWT_SECRET = process.env.JWT_SECRET ?? "default-secret";

//middleware de JWT para ver si estamos autenticados
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No autorizado" });
  }
  jwt.verify(token, JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(403).json({ error: "No tienes acceso a este recurso" });
    }
    next();
  });
};

router.post("/", authenticateToken, createUser);
router.get("/", authenticateToken, getAllUsers);
router.get("/:id", authenticateToken, getUserById);
router.put("/:id", authenticateToken, updatedUser);
router.delete("/:id", authenticateToken, deleteUser);

export default router;
