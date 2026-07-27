import { Router } from "express";
import {
  addToWishlist,
  getWishlist,
  getWishlistProductIds,
  removeFromWishlist,
} from "../controllers/wishlist.controller";
import { shouldBeUser } from "../middleware/authMiddleware";

const router: Router = Router();

router.get("/", shouldBeUser, getWishlist);
router.get("/ids", shouldBeUser, getWishlistProductIds);
router.post("/:productId", shouldBeUser, addToWishlist);
router.delete("/:productId", shouldBeUser, removeFromWishlist);

export default router;
