const express = require("express");
const {
  getRecipes,
  createRecipe,
  getRecipe,
  updateRecipe,
  deleteRecipe,
  isPublished,
  voteRecipe,
} = require("../controllers/RecipeController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", getRecipes);
router.get("/:id", getRecipe);
router.put("/:id", authenticate, updateRecipe);
router.post("/", authenticate, createRecipe);
router.delete("/:id", authenticate, deleteRecipe);
// router.delete('/:id/print', authenticate, printRecipe)
router.patch("/:id/publish", authenticate, isPublished);
router.post("/:id/vote", authenticate, voteRecipe);

module.exports = router;
