import { Request, Response } from "express";
import { prisma, Prisma } from "@repo/product-db";
import { StripeProductType } from "@repo/types";
import { producer } from "../utils/kafka";

export const createProduct = async ( req: Request, res: Response ) => {
    const data : Prisma.ProductCreateManyInput = req.body;

    const {colors , images} =  data;
    
    if(!colors || !Array.isArray(colors) || colors.length === 0){
        return res.status(400).json({message: "Colors array is required!"});
    }

    if(!images || typeof images !== "object"){
        return res.status(400).json({message: "Images object is required!"});
    }

    const missingColors = colors.filter((color) => !(color in images));

    if(missingColors.length > 0) {
        return res.status(400).json({message: "Missing images for colors: " , missingColors})
    }
 
    const product = await prisma.product.create({data});
    
    const stripeProduct : StripeProductType = {
      id : product.id.toString(),
      name: product.name, 
      price: product.price,
    }
    producer.send("product.created", { value: stripeProduct });
    
    res.status(201).json(product);
};   

export const updateProduct = async ( req: Request, res: Response ) => {
    const {id} = req.params;

    const data : Prisma.ProductUpdateInput = req.body;

    const updatedProduct = await prisma.product.update({
        where: {id: Number(id)},
        data,
    });
    res.status(200).json(updatedProduct);
};

export const deleteProduct = async ( req: Request, res: Response ) => {
    const {id} = req.params;

    const deletedProduct = await prisma.product.delete({
        where: {id: Number(id)}
    });

    producer.send("product.deleted", { value: Number(id) });
    
    res.status(200).json(deletedProduct );
};

export const getProducts = async ( req: Request, res: Response ) => {
  const { sort, category, search, limit } = req.query;

  const orderBy = (() => {
    switch (sort) {
      case "asc":
        return { price: Prisma.SortOrder.asc };
      case "desc":
        return { price: Prisma.SortOrder.desc };
      case "oldest":
        return { createdAt: Prisma.SortOrder.asc };
      default:
        return { createdAt: Prisma.SortOrder.desc };
    }
  })();

  const where: Prisma.ProductWhereInput = {};

  if (category && typeof category === "string") {
    where.categorySlug = category;
  }

  if (search && typeof search === "string" && search.trim() !== "") {
    const searchStr = search.trim();
    const searchNormalized =
      searchStr.endsWith("s") && searchStr.length > 3
        ? searchStr.slice(0, -1)
        : searchStr;
    const searchNoHyphen = searchStr.replace(/-/g, " ");

    const terms = Array.from(
      new Set([searchStr, searchNormalized, searchNoHyphen])
    ).filter(Boolean);

    where.OR = terms.flatMap((term) => [
      { name: { contains: term, mode: "insensitive" } },
      { shortDescription: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { categorySlug: { contains: term, mode: "insensitive" } },
      { category: { is: { name: { contains: term, mode: "insensitive" } } } },
      { category: { is: { slug: { contains: term, mode: "insensitive" } } } },
    ]);
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    take: limit ? Number(limit) : undefined,
  });

  res.status(200).json(products);
};

export const getProduct = async ( req: Request, res: Response ) => {
    const {id} = req.params;

    const product = await prisma.product.findUnique({
        where: {id: Number(id)}
    });

    return res.status(200).json(product);
};
