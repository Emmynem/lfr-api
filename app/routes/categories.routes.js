import { checks } from "../middleware/index.js";
import { categories_rules } from "../rules/categories.rules.js";
import { default_rules } from "../rules/default.rules.js";
import { categoryImageMiddleware } from "../middleware/uploads.js";
import {
	addCategory, deleteCategory, rootGetCategory, rootGetCategories, rootSearchCategories, searchCategories, updateCategory,
	updateCategoryImage, publicGetCategories, publicGetCategorySpecifically, publicSearchCategories, toggleStatus
} from "../controllers/categories.controller.js";

export default function (app) {
	app.get("/root/categories", [checks.verifyKey, checks.isRootKey], rootGetCategories);
	app.get("/root/search/categories", [checks.verifyKey, checks.isRootKey, default_rules.forSearching], rootSearchCategories);
	app.get("/root/category", [checks.verifyKey, checks.isRootKey, categories_rules.forFindingCategory], rootGetCategory);
	
	app.get("/public/categories", publicGetCategories);
	app.get("/public/search/categories", [default_rules.forSearching], publicSearchCategories);
	app.get("/public/category/stripped", [categories_rules.forFindingViaStripped], publicGetCategorySpecifically);

	app.post("/root/category/add", [checks.verifyKey, checks.isRootKey, categoryImageMiddleware, categories_rules.forAdding], addCategory);

	app.put("/root/category/update", [checks.verifyKey, checks.isRootKey, categories_rules.forFindingCategory, categories_rules.forUpdatingDetails], updateCategory);
	app.put("/root/category/image", [checks.verifyKey, checks.isRootKey, categoryImageMiddleware, categories_rules.forFindingCategory], updateCategoryImage);
	app.put("/root/category/toggle/status", [checks.verifyKey, checks.isRootKey, categories_rules.forFindingCategoryInternal], toggleStatus);

	app.delete("/root/category", [checks.verifyKey, checks.isRootKey, categories_rules.forFindingCategory], deleteCategory);
};
