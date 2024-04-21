import { validationResult, matchedData } from 'express-validator';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import {
	default_delete_status, default_status, false_status, paginate, tag_root, true_status, return_all_letters_uppercase, strip_text, 
	post_document_path, anonymous, zero
} from '../config/config.js';
import db from "../models/index.js";
import { uploadFile, deleteFile } from '../config/cloudinary.js';

const POSTS = db.posts;
const CATEGORIES = db.categories;
const Op = db.Sequelize.Op;

export async function rootGetPosts(req, res) {
	const total_records = await POSTS.count();
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	POSTS.findAndCountAll({
		attributes: { exclude: ['id', 'image_public_id'] },
		order: [
			[orderBy, sortBy]
		],
		include: [
			{
				model: CATEGORIES,
				attributes: ['name', 'stripped', 'image']
			},
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(posts => {
		if (!posts || posts.length === 0) {
			SuccessResponse(res, { unique_id: tag_root, text: "Posts Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: tag_root, text: "Posts loaded" }, { ...posts, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: tag_root, text: err.message }, null);
	});
};

export function rootGetPost(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		POSTS.findOne({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				...payload
			},
			include: [
				{
					model: CATEGORIES,
					attributes: ['name', 'stripped', 'image']
				},
			],
		}).then(post => {
			if (!post) {
				NotFoundError(res, { unique_id: tag_root, text: "Post not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Post loaded" }, post);
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function rootSearchPosts(req, res) {
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";
	
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await POSTS.count({
			where: {
				title: {
					[Op.or]: {
						[Op.like]: `%${payload.search}`,
						[Op.startsWith]: `${payload.search}`,
						[Op.endsWith]: `${payload.search}`,
						[Op.substring]: `${payload.search}`,
					}
				}
			}
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		POSTS.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				title: {
					[Op.or]: {
						[Op.like]: `%${payload.search}`,
						[Op.startsWith]: `${payload.search}`,
						[Op.endsWith]: `${payload.search}`,
						[Op.substring]: `${payload.search}`,
					}
				}
			},
			order: [
				['title', 'ASC'],
				[orderBy, sortBy]
			],
			include: [
				{
					model: CATEGORIES,
					attributes: ['name', 'stripped', 'image']
				},
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(posts => {
			if (!posts || posts.length === 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Posts Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Posts loaded" }, { ...posts, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function publicGetPosts(req, res) {
	const total_records = await POSTS.count({ where: { status: default_status } });
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	POSTS.findAndCountAll({
		attributes: { exclude: ['id', 'image_public_id', 'details'] },
		where: {
			status: default_status
		},
		order: [
			[orderBy, sortBy]
		],
		include: [
			{
				model: CATEGORIES,
				attributes: ['name', 'stripped', 'image']
			},
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(posts => {
		if (!posts || posts.length == 0) {
			SuccessResponse(res, { unique_id: anonymous, text: "Posts Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: anonymous, text: "Posts loaded" }, { ...posts, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: anonymous, text: err.message }, null);
	});
};

export async function publicGetPostsSpecifically(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await POSTS.count({ where: { ...payload, status: default_status } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		POSTS.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id', 'details'] },
			where: {
				...payload,
				status: default_status
			},
			order: [
				[orderBy, sortBy]
			],
			include: [
				{
					model: CATEGORIES,
					attributes: ['name', 'stripped', 'image']
				},
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(posts => {
			if (!posts || posts.length == 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Posts specifically Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Posts specifically loaded" }, { ...posts, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export function publicGetPostSpecifically(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		POSTS.findOne({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				...payload,
				status: default_status
			},
			include: [
				{
					model: CATEGORIES,
					attributes: ['name', 'stripped', 'image']
				},
			],
		}).then(async post => {
			if (!post) {
				NotFoundError(res, { unique_id: anonymous, text: "Post not found" }, null);
			} else {
				const post_view_update = await POSTS.increment({ views: 1 }, { where: { ...payload } });
				SuccessResponse(res, { unique_id: anonymous, text: "Post loaded" }, post);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicLikePost(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const post_view_update = await POSTS.increment({ likes: 1 }, { where: { ...payload } });

		if (post_view_update.length > 0) {
			SuccessResponse(res, { unique_id: anonymous, text: "Post liked" }, null);
		} else {
			BadRequestError(res, { unique_id: anonymous, text: "Error liking post" }, null);
		}
	}
};

export async function publicSearchPosts(req, res) {
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await POSTS.count({
			where: {
				title: {
					[Op.or]: {
						[Op.like]: `%${payload.search}`,
						[Op.startsWith]: `${payload.search}`,
						[Op.endsWith]: `${payload.search}`,
						[Op.substring]: `${payload.search}`,
					}
				},
				status: default_status
			}
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		POSTS.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id', 'details'] },
			where: {
				title: {
					[Op.or]: {
						[Op.like]: `%${payload.search}`,
						[Op.startsWith]: `${payload.search}`,
						[Op.endsWith]: `${payload.search}`,
						[Op.substring]: `${payload.search}`,
					}
				},
				status: default_status
			},
			order: [
				['title', 'ASC'],
				[orderBy, sortBy]
			],
			include: [
				{
					model: CATEGORIES,
					attributes: ['name', 'stripped', 'image']
				},
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(posts => {
			if (!posts || posts.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Posts Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Posts loaded" }, { ...posts, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addPost(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			if (req.file) {
				const uploadFileRes = await uploadFile(req.file, post_document_path);

				if (uploadFileRes.success) {
					await db.sequelize.transaction(async (transaction) => {
						const post = await POSTS.create(
							{
								unique_id: uuidv4(),
								...payload,
								stripped: strip_text(payload.title),
								details: payload.details,
								image: uploadFileRes.secure_url,
								image_public_id: uploadFileRes.public_id,
								views: zero,
								likes: zero,
								status: default_status
							}, { transaction }
						);

						if (post) {
							SuccessResponse(res, { unique_id: tag_root, text: "Post created successfully!" });
						} else {
							throw new Error("Error adding post");
						}
					});
				} else {
					BadRequestError(res, { unique_id: tag_root, text: "Error uploading image!" }, null);
				}
			} else {
				BadRequestError(res, { unique_id: tag_root, text: "Image is required!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function updatePost(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const post = await POSTS.update(
					{
						...payload,
						stripped: strip_text(payload.title),
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (post > 0) {
					SuccessResponse(res, { unique_id: tag_root, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Post not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function updatePostAltText(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const post = await POSTS.update(
					{
						alt_text: payload.alt_text,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (post > 0) {
					SuccessResponse(res, { unique_id: tag_root, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Post not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function updatePostDetails(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const post = await POSTS.update(
					{
						details: payload.details,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (post > 0) {
					SuccessResponse(res, { unique_id: tag_root, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Post not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function updatePostImage(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const edit_details = await POSTS.findOne({
				attributes: ["unique_id", "image", "image_public_id"],
				where: {
					unique_id: payload.unique_id
				}
			});

			if (!edit_details) {
				NotFoundError(res, { unique_id: tag_root, text: "Post not found" }, null);
			} else {
				if (req.file) {
					const uploadFileRes = await uploadFile(req.file, post_document_path);

					if (uploadFileRes.success) {
						await db.sequelize.transaction(async (transaction) => {
							const post = await POSTS.update(
								{
									image: uploadFileRes.secure_url,
									image_public_id: uploadFileRes.public_id,
								}, {
									where: {
										unique_id: payload.unique_id,
										status: default_status
									},
									transaction
								}
							);

							if (post > 0) {
								SuccessResponse(res, { unique_id: tag_root, text: "Details updated successfully!" }, null);

								// Delete former file available
								if (edit_details.image_public_id !== null) {
									deleteFile(edit_details.image_public_id);
								}
							} else {
								throw new Error("User not found");
							}
						});
					} else {
						BadRequestError(res, { unique_id: tag_root, text: "Error uploading image!" }, null);
					}
				} else {
					BadRequestError(res, { unique_id: tag_root, text: "Image is required!" }, null);
				}
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function toggleStatus(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const details = await POSTS.findOne({
				attributes: ['unique_id', 'status'],
				where: {
					...payload
				}
			});

			if (!details) {
				BadRequestError(res, { unique_id: tag_root, text: "Details not found!" });
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const post = await POSTS.update(
						{
							status: details.status === default_status ? default_delete_status : default_status,
						}, {
							where: {
								unique_id: details.unique_id,
							},
							transaction
						}
					);

					if (post > 0) {
						SuccessResponse(res, { unique_id: tag_root, text: "Status updated successfully!" }, null);
					} else {
						throw new Error("Post not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function deletePost(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const edit_details = await POSTS.findOne({
				attributes: ["unique_id", "image", "image_public_id"],
				where: {
					unique_id: payload.unique_id
				}
			});

			if (!edit_details) {
				NotFoundError(res, { unique_id: tag_root, text: "Post not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {

					const post = await POSTS.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (post > 0) {
						OtherSuccessResponse(res, { unique_id: tag_root, text: "Post was deleted successfully!" });

						// Delete former file available
						if (edit_details.image_public_id !== null) {
							deleteFile(edit_details.image_public_id);
						}
					} else {
						throw new Error("Error deleting post");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};