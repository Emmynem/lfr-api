import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import {
	default_status, check_length_TEXT, strip_text, return_default_value, validate_future_date, validate_future_end_date, default_delete_status
} from '../config/config.js';

const POSTS = db.posts;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const posts_rules = {
	forFindingPostInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return POSTS.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Post not found!');
				});
			})
	],
	forFindingPost: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return POSTS.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Post not found!');
				});
			})
	],
	forFindingPostFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return POSTS.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Post not found!');
				});
			})
	],
	forFindingPostAlt: [
		check('post_unique_id', "Post Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(post_unique_id => {
				return POSTS.findOne({ where: { unique_id: post_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Post not found!');
				});
			})
	],
	forAdding: [
		check('title', "Title is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters")
			.bail()
			.custom((title, { req }) => {
				return POSTS.findOne({
					where: {
						[Op.or]: [
							{
								title: {
									[Op.like]: `%${title}`
								}
							},
							{
								stripped: strip_text(title)
							}
						],
						category_unique_id: req.query.category_unique_id || req.body.category_unique_id || '',
						status: default_status
					}
				}).then(data => {
					if (data) return Promise.reject('Post already exists!');
				});
			}),
		check('alt_text', "Alt Text is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters"),
		check('details', "Details is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isLength({ min: 3, max: check_length_TEXT })
			.withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
		// check('image')
		// 	.optional({ checkFalsy: false })
		// 	.bail()
		// 	.isURL()
		// 	.withMessage("Value must be a specified url path to an image"),
		// check('image_file_ext', "Image File Ext is required")
		// 	.exists({ checkNull: true, checkFalsy: true }),
		// check('image_size', "Image size is required")
		// 	.exists({ checkNull: true, checkFalsy: true }),
	],
	forUpdatingTitle: [
		check('title', "Title is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters")
			.bail()
			.custom((title, { req }) => {
				return POSTS.findOne({
					where: {
						[Op.or]: [
							{
								title: {
									[Op.like]: `%${title}`
								}
							},
							{
								stripped: strip_text(title)
							}
						],
						unique_id: {
							[Op.ne]: req.query.unique_id || req.body.unique_id || '',
						},
						category_unique_id: req.query.category_unique_id || req.body.category_unique_id || '',
						status: default_status
					}
				}).then(data => {
					if (data) return Promise.reject('Post already exists!');
				});
			}),
	],
	forUpdatingAltText: [
		check('alt_text', "Alt Text is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters")
	],
	forUpdatingDetails: [
		check('details', "Details is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isLength({ min: 3, max: check_length_TEXT })
			.withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`)
	],
	forUpdatingImage: [
		check('image', "Image is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isURL()
			.withMessage("Value must be a specified url path to an image"),
		// check('image_file_ext', "Image File Ext is required")
		// 	.exists({ checkNull: true, checkFalsy: true }),
		// check('image_size', "Image size is required")
		// 	.exists({ checkNull: true, checkFalsy: true }),
	],
	forFindingViaStripped: [
		check('stripped', "Stripped is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters")
			.bail()
			.custom((stripped, { req }) => {
				return POSTS.findOne({
					where: {
						stripped: stripped,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Post not found!');
				});
			}),
	]
};  