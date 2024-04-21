import { checks } from "../middleware/index.js";
import { posts_rules } from "../rules/posts.rules.js";
import { categories_rules } from "../rules/categories.rules.js";
import { default_rules } from "../rules/default.rules.js";
import { postImageMiddleware } from "../middleware/uploads.js";
import {
	addPost, deletePost, rootGetPost, rootGetPosts, rootSearchPosts, searchPosts, updatePost,
	updatePostImage, publicGetPosts, publicGetPostsSpecifically, publicGetPostSpecifically, publicSearchPosts, 
	updatePostDetails, toggleStatus, updatePostAltText, publicLikePost
} from "../controllers/posts.controller.js";

export default function (app) {
	app.get("/root/posts", [checks.verifyKey, checks.isRootKey], rootGetPosts);
	app.get("/root/search/posts", [checks.verifyKey, checks.isRootKey, default_rules.forSearching], rootSearchPosts);
	app.get("/root/post", [checks.verifyKey, checks.isRootKey, posts_rules.forFindingPost], rootGetPost);

	app.get("/public/posts", publicGetPosts);
	app.get("/public/search/posts", [default_rules.forSearching], publicSearchPosts);
	app.get("/public/posts/via/category", [categories_rules.forFindingCategoryAlt], publicGetPostsSpecifically);
	app.get("/public/post/stripped", [posts_rules.forFindingViaStripped], publicGetPostSpecifically);
	
	app.post("/public/post/like", [posts_rules.forFindingPost], publicLikePost);
	
	app.post("/root/post/add", [checks.verifyKey, checks.isRootKey, postImageMiddleware, categories_rules.forFindingCategoryAlt, posts_rules.forAdding], addPost);

	app.put("/root/post/update", [checks.verifyKey, checks.isRootKey, posts_rules.forFindingPost, categories_rules.forFindingCategoryAlt, posts_rules.forUpdatingTitle], updatePost);
	app.put("/root/post/update/alt/text", [checks.verifyKey, checks.isRootKey, posts_rules.forFindingPost, posts_rules.forUpdatingAltText], updatePostAltText);
	app.put("/root/post/update/details", [checks.verifyKey, checks.isRootKey, posts_rules.forFindingPost, posts_rules.forUpdatingDetails], updatePostDetails);
	app.put("/root/post/image", [checks.verifyKey, checks.isRootKey, postImageMiddleware, posts_rules.forFindingPost], updatePostImage);
	app.put("/root/post/toggle/status", [checks.verifyKey, checks.isRootKey, posts_rules.forFindingPostInternal], toggleStatus);

	app.delete("/root/post", [checks.verifyKey, checks.isRootKey, posts_rules.forFindingPost], deletePost);
};
