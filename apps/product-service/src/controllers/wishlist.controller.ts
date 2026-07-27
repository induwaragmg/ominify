import { prisma } from "@repo/product-db";
import { Request, Response } from "express";

export const getWishlist = async (req: Request, res: Response) => {
  const wishlist = await prisma.wishlist.findMany({
    where: {
      userId: req.userId,
    },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json(
    wishlist.map((item) => ({
      id: item.id,
      productId: item.productId,
      createdAt: item.createdAt,
      product: item.product,
    })),
  );
};

export const getWishlistProductIds = async (req: Request, res: Response) => {
  const wishlist = await prisma.wishlist.findMany({
    where: {
      userId: req.userId,
    },
    select: {
      productId: true,
    },
  });

  return res.status(200).json(wishlist.map((item) => item.productId));
};

export const addToWishlist = async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);

  if (!Number.isInteger(productId)) {
    return res.status(400).json({ message: "Invalid product id." });
  }

  const wishlistItem = await prisma.wishlist.upsert({
    where: {
      userId_productId: {
        userId: req.userId as string,
        productId,
      },
    },
    create: {
      userId: req.userId as string,
      productId,
    },
    update: {},
    include: {
      product: true,
    },
  });

  return res.status(201).json({
    id: wishlistItem.id,
    productId: wishlistItem.productId,
    createdAt: wishlistItem.createdAt,
    product: wishlistItem.product,
  });
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);

  if (!Number.isInteger(productId)) {
    return res.status(400).json({ message: "Invalid product id." });
  }

  await prisma.wishlist.deleteMany({
    where: {
      userId: req.userId,
      productId,
    },
  });

  return res.status(200).json({ productId });
};
