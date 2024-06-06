import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../services/passwordService";
import prisma from "../models/user";
import { generateToken } from "../services/authService";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ message: "El email es obligatorio" });
    return;
  }
  if (!password) {
    res.status(400).json({ message: "El password es obligatorio" });
    return;
  }
  try {
    const hashedPassword = await hashPassword(password);
    const user = await prisma.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    const token = generateToken(user);
    res.status(201).json({ token });
  } catch (error: any) {
    if (!email) {
      res.status(400).json({ message: "El email es obligatorio" });
      return;
    }
    if (!password) {
      res.status(400).json({ message: "El password es obligatorio" });
      return;
    }
    if (error?.code == "P2002" && error?.meta?.target?.includes("email")) {
      res.status(400).json({ mesage: "El email ingresado ya existe" });
      return;
    }
    console.log(error);
    res.status(500).json({ error: "Hubo un error en el registro" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ message: "El email es obligatorio" });
    return;
  }
  if (!password) {
    res.status(400).json({ message: "El password es obligatorio" });
    return;
  }
  try {
    const user = await prisma.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: "Usuario no encontrado" });
      return;
    }
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Usuario y contraseña no coinciden" });
      return;
    }
    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (error: any) {
    console.log("Error: ", error);
  }
};
