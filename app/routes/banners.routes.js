import { checks } from "../middleware/index.js";
import { banners_rules } from "../rules/banners.rules.js";
import { default_rules } from "../rules/default.rules.js";
import { bannerImageMiddleware } from "../middleware/uploads.js";
import {
	addBanner, deleteBanner, publicGetBanners, rootGetBanner, rootGetBanners, toggleStatus, updateBanner, 
	updateBannerImage
} from "../controllers/banners.controller.js";

export default function (app) {
	app.get("/root/banners", [checks.verifyKey, checks.isRootKey], rootGetBanners);
	app.get("/root/banner", [checks.verifyKey, checks.isRootKey, banners_rules.forFindingBanner], rootGetBanner);

	app.get("/public/banners", publicGetBanners);

	app.post("/root/banner/add", [checks.verifyKey, checks.isRootKey, bannerImageMiddleware, banners_rules.forAddingAndUpdating], addBanner);

	app.put("/root/banner/update", [checks.verifyKey, checks.isRootKey, banners_rules.forFindingBanner, banners_rules.forAddingAndUpdating], updateBanner);
	app.put("/root/banner/image", [checks.verifyKey, checks.isRootKey, bannerImageMiddleware, banners_rules.forFindingBanner], updateBannerImage);
	app.put("/root/banner/toggle/status", [checks.verifyKey, checks.isRootKey, banners_rules.forFindingBannerInternal], toggleStatus);

	app.delete("/root/banner", [checks.verifyKey, checks.isRootKey, banners_rules.forFindingBanner], deleteBanner);
};
