import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "smart_caravan_secret_key_2026";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    res.status(201).json({ message: "Utilisateur créé avec succès", userId: user.id });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'inscription", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la connexion", error });
  }
};
