import { validationResult, matchedData } from 'express-validator';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import {
	default_delete_status, default_status, false_status, paginate, tag_root, true_status, return_all_letters_uppercase, category_document_path, 
	anonymous, strip_text
} from '../config/config.js';
import db from "../models/index.js";
import { uploadFile, deleteFile } from '../config/cloudinary.js';

const CATEGORIES = db.categories;
const Op = db.Sequelize.Op;

export async function rootGetCategories(req, res) {
	const total_records = await CATEGORIES.count();
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	CATEGORIES.findAndCountAll({
		attributes: { exclude: ['id', 'image_public_id'] },
		order: [
			[orderBy, sortBy]
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(categories => {
		if (!categories || categories.length === 0) {
			SuccessResponse(res, { unique_id: tag_root, text: "Categories Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: tag_root, text: "Categories loaded" }, { ...categories, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: tag_root, text: err.message }, null);
	});
};

export function rootGetCategory(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		CATEGORIES.findOne({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				...payload
			}
		}).then(category => {
			if (!category) {
				NotFoundError(res, { unique_id: tag_root, text: "Category not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Category loaded" }, category);
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function rootSearchCategories(req, res) {
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await CATEGORIES.count({
			where: {
				name: {
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

		CATEGORIES.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				name: {
					[Op.or]: {
						[Op.like]: `%${payload.search}`,
						[Op.startsWith]: `${payload.search}`,
						[Op.endsWith]: `${payload.search}`,
						[Op.substring]: `${payload.search}`,
					}
				}
			},
			order: [
				['name', 'ASC'],
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(categories => {
			if (!categories || categories.length === 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Categories Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Categories loaded" }, { ...categories, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function publicGetCategories(req, res) {
	const total_records = await CATEGORIES.count({ where: { status: default_status } });
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	CATEGORIES.findAndCountAll({
		attributes: { exclude: ['id', 'image_public_id', 'createdAt', 'updatedAt'] },
		where: {
			status: default_status
		},
		order: [
			[orderBy, sortBy]
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(categories => {
		if (!categories || categories.length == 0) {
			SuccessResponse(res, { unique_id: anonymous, text: "Categories Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: anonymous, text: "Categories loaded" }, { ...categories, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: anonymous, text: err.message }, null);
	});
};

export function publicGetCategorySpecifically(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		CATEGORIES.findOne({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				...payload,
				status: default_status
			}
		}).then(category => {
			if (!category) {
				NotFoundError(res, { unique_id: anonymous, text: "Category specifically not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Category specifically loaded" }, category);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicSearchCategories(req, res) {
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await CATEGORIES.count({
			where: {
				name: {
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

		CATEGORIES.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				name: {
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
				['name', 'ASC'],
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(categories => {
			if (!categories || categories.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Categories Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Categories loaded" }, { ...categories, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addCategory(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			if (req.file) {
				const uploadFileRes = await uploadFile(req.file, category_document_path);

				if (uploadFileRes.success) {
					await db.sequelize.transaction(async (transaction) => {
						const category = await CATEGORIES.create(
							{
								unique_id: uuidv4(),
								...payload,
								stripped: strip_text(payload.name),
								image: uploadFileRes.secure_url,
								image_public_id: uploadFileRes.public_id,
								status: default_status
							}, { transaction }
						);

						if (category) {
							SuccessResponse(res, { unique_id: tag_root, text: "Category created successfully!" });
						} else {
							throw new Error("Error adding category");
						}
					});
				} else {
					BadRequestError(res, { unique_id: tag_root, text: "Error uploading image!" }, null);
				}
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const category = await CATEGORIES.create(
						{
							unique_id: uuidv4(),
							...payload,
							stripped: strip_text(payload.name),
							image: null,
							image_public_id: null,
							status: default_status
						}, { transaction }
					);

					if (category) {
						SuccessResponse(res, { unique_id: tag_root, text: "Category created successfully!" });
					} else {
						throw new Error("Error adding category");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function updateCategory(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const category = await CATEGORIES.update(
					{
						...payload,
						stripped: strip_text(payload.name),
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (category > 0) {
					SuccessResponse(res, { unique_id: tag_root, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Category not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function updateCategoryImage(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const edit_details = await CATEGORIES.findOne({
				attributes: ["unique_id", "image", "image_public_id"],
				where: {
					unique_id: payload.unique_id
				}
			});

			if (!edit_details) {
				NotFoundError(res, { unique_id: tag_root, text: "Category not found" }, null);
			} else {
				if (req.file) {
					const uploadFileRes = await uploadFile(req.file, category_document_path);

					if (uploadFileRes.success) {
						await db.sequelize.transaction(async (transaction) => {
							const category = await CATEGORIES.update(
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

							if (category > 0) {
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
			const details = await CATEGORIES.findOne({
				attributes: ['unique_id', 'status'],
				where: {
					...payload
				}
			});

			if (!details) {
				BadRequestError(res, { unique_id: tag_root, text: "Details not found!" });
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const category = await CATEGORIES.update(
						{
							status: details.status === default_status ? default_delete_status : default_status,
						}, {
							where: {
								unique_id: details.unique_id,
							},
							transaction
						}
					);

					if (category > 0) {
						SuccessResponse(res, { unique_id: tag_root, text: "Status updated successfully!" }, null);
					} else {
						throw new Error("Category not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function deleteCategory(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const edit_details = await CATEGORIES.findOne({
				attributes: ["unique_id", "image", "image_public_id"],
				where: {
					unique_id: payload.unique_id
				}
			});

			if (!edit_details) {
				NotFoundError(res, { unique_id: tag_root, text: "Category not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {

					const category = await CATEGORIES.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (category > 0) {
						OtherSuccessResponse(res, { unique_id: tag_root, text: "Category was deleted successfully!" });

						// Delete former file available
						if (edit_details.image_public_id !== null) {
							deleteFile(edit_details.image_public_id);
						}
					} else {
						throw new Error("Error deleting category");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};