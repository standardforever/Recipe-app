const asyncHandler = require("express-async-handler");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const { buildPDF } = require("../utils/pdf-service");

/**
 * @desc Get Recepie list
 * @route GET
 * @route /api/getAllRecipes
 * @access Public
 */
const getRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find();
  if (!recipes) {
    res.status(404);
    throw new Error(`No Recepies found`);
  }

  return res.status(200).json({ recipes });
});

/**
 * @desc Add a recipe
 * @route Post
 * @route api/v1/recipe
 * @access Private
 */
const createRecipe = asyncHandler(async (req, res) => {
  //  Get user id and add to the body field
  req.body.user = req.user.id;

  const { title, description, utensils, user, ingredients, steps, image } =
    req.body;

  const recipe = await Recipe.create({
    title: title,
    author: user,
    image: image,
    description: description,
    utensils: utensils,
    ingredients,
    steps,
  });

  const createdRecipe = await recipe.save();
  res.status(201).json({ createdRecipe });
});

const getRecipe = asyncHandler(async (req, res) => {
  const { id: recipeID } = req.params;
  const recipe = await Recipe.findOne({ _id: recipeID });
  if (!recipe) {
    res.status(404);
    throw new Error(`No recipe with id : ${recipeID}`);
  }

  return res.status(200).json({ recipe });
});

const updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    res.status(400);
    throw new Error("Recipe not found");
  }

  if (!req.user) {
    req.status(401);
    throw new Error("User not found");
  }

  // check for owner Recipe
  if (recipe.author.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  const updaterecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updaterecipe);
});

const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    res.status(400);
    throw new Error("Recipe is not found");
  }

  //  check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not authorized");
  }

  // Check for owner study
  if (recipe.author.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  await recipe.remove();

  res
    .status(200)
    .json({ id: req.params.id, msg: "Recipe Deleted Successfully" });
});

const isPublished = asyncHandler(async (req, res) => {
  const user = req.user;
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    res.status(400);
    throw new Error("Recipe is not found");
  }

  //  check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not authorized");
  }

  // Check for owner study
  if (recipe.author.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  recipe.isPublished = !recipe.isPublished;
  await recipe.save();

  return res.status(200).json({
    isPublished: recipe.isPublished,
    msg: "Your Recipe has been Published Successfully",
  });
});

const voteRecipe = asyncHandler(async (req, res) => {
  // get id of recipe
  const recipe = await Recipe.findById(req.params.id);
  // get user id and add to the body field
  const userId = req.user.id;

  //check if the recipe exists
  if (!recipe) {
    return res.status(400).send({ message: "Recipe is not found" });
  } else {
    const index = recipe.voteID.findIndex((id) => id === String(userId));
    // check if userid is already in the voteIDarray
    if (index === -1) {
      recipe.voteID.push(userId);
      //update the vote count
      recipe.voteCount = recipe.voteCount + 1;
      //save the recipe
      await recipe.save();
      console.log(recipe);
      //return the updated recipe
      return res.status(200).json(recipe);
    } else {
      // if user id is already in the array, send error message
      return res.status(400).send({ message: "You have already voted" });
    }
  }
});

module.exports = {
  getRecipes,
  createRecipe,
  getRecipe,
  updateRecipe,
  deleteRecipe,
  isPublished,
  voteRecipe,
};
