import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// 1. Create a product (req.body)
app.post("/products", async (req, res) => {
  try {
    const newProduct = await prisma.product.create({ data: req.body });
    res.json(newProduct);
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : "Unknown error");
  }
});

// 2. Get products with query filters, pagination, and sorting (req.query)
// /products?category=Electronics&minPrice=10&maxPrice=100&skip=0&take=10&sortBy=price&order=asc
app.get("/products", async (req, res) => {
  try {
    const { category, minPrice, maxPrice, skip, take, sortBy, order } = req.query;
    const priceFilter = {
      ...(minPrice !== undefined ? { gte: Number(minPrice) } : {}),
      ...(maxPrice !== undefined ? { lte: Number(maxPrice) } : {})
    };
    const products = await prisma.product.findMany({
      where: {
        ...(Object.keys(priceFilter).length > 0 ? { price: priceFilter } : {}),
        category: category ? { name: { equals: String(category) } } : undefined,
      },
      include: { category: true },
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      orderBy: sortBy ? { [String(sortBy)]: order === "desc" ? "desc" : "asc" } : undefined,
    });
    res.json(products);
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : "Unknown error");
  }
});

// 4. Delete a product by id (req.params)
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id: Number(id) } });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : "Unknown error");
  }
});

// 5. Get a single product by id (req.params)
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : "Unknown error");
  }
});

// 6. Get all products for a given category (req.params)
app.get("/categories/:categoryId/products", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await prisma.product.findMany({
      where: { categoryId: Number(categoryId) },
      include: { category: true },
    });
    res.json(products);
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : "Unknown error");
  }
});

// 7. Get all orders for a given customer (req.params)
app.get("/customers/:customerId/orders", async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await prisma.order.findMany({
      where: { customerId: Number(customerId) },
      include: { items: { include: { product: true } } },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : "Unknown error");
  }
});

// 3. Update product by id (req.params)
app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : "Unknown error");
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

export default app;
