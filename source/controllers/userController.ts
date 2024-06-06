import { Request, Response } from "express";
import { hashPassword } from "../services/passwordService";
import prisma from "../models/user";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ message: "El email es obligatorio" });
      return;
    }
    if (!password) {
      res.status(400).json({ message: "El password es obligatorio" });
      return;
    }
    const hashedPassword = await hashPassword(password);
    const user = await prisma.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json(user);
  } catch (error: any) {
    if (error?.code == "P2002" && error?.meta?.target?.includes("email")) {
      res.status(400).json({ mesage: "El email ingresado ya existe" });
      return;
    }
    console.log(error);
    res.status(500).json({ error: "Hubo un error, intentelo de nuevo" });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.findMany();
    res.status(200).json(users);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Hubo un error, intentelo de nuevo" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id);
  if (!id) {
    res.status(400).json({ message: "Id debe ser necesario" });
    return;
  }
  try {
    const user = await prisma.findUnique({ where: { id: id } });
    if (!user) {
      res.status(404).json({ error: "El usuario no fue encontrado" });
      return;
    }
    res.status(200).json(user);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Hubo un error, intentelo de nuevo" });
  }
};

export const updatedUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id);
  if (!id) {
    res.status(400).json({ message: "Id debe ser necesario" });
    return;
  }
  const { email, password } = req.body;
  try {
    let dataToUpdate: any = { ...req.body };
    if (password) {
      const hashedPassword = await hashPassword(password);
      dataToUpdate.password = hashedPassword;
    }
    if (email) {
      dataToUpdate.email = email;
    }
    const user = await prisma.update({ where: { id: id }, data: dataToUpdate });
    res.status(200).json(user);
  } catch (error: any) {
    if (error?.code == "P2002" && error?.meta?.target?.includes("email")) {
      res.status(400).json({ mesage: "El email ingresado ya existe" });
      return;
    } else if (error?.code == "P2025") {
      res.status(404).json({ message: "Usuario no encontrado" });
    } else {
      res.status(500).json({ error: "Hubo un error, intenta de nuevo" });
    }
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id);
  if (!id) {
    res.status(400).json({ message: "Id debe ser necesario" });
    return;
  }
  try {
    await prisma.delete({ where: { id: id } });
    res
      .status(200)
      .json({ message: `El usuario con el ID ${id} fue eliminado con éxito` })
      .end();
  } catch (error: any) {
    if (error?.code == "P2025") {
      res.status(404).json({ messages: "Usuario no econtrado" });
    } else {
      res.status(500).json({ error: "Hubo un error, intente mas tarde" });
    }
  }
};
