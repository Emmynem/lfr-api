import { validationResult, matchedData } from 'express-validator';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import {
	default_delete_status, default_status, false_status, paginate, tag_root, true_status, return_all_letters_uppercase, strip_text,
	banner_document_path, anonymous, zero
} from '../config/config.js';
import db from "../models/index.js";
import { uploadFile, deleteFile } from '../config/cloudinary.js';

const BANNERS = db.banners;
const Op = db.Sequelize.Op;

export async function rootGetBanners(req, res) {
	const total_records = await BANNERS.count();
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	BANNERS.findAndCountAll({
		attributes: { exclude: ['id', 'image_public_id'] },
		order: [
			[orderBy, sortBy]
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(banners => {
		if (!banners || banners.length === 0) {
			SuccessResponse(res, { unique_id: tag_root, text: "Banners Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: tag_root, text: "Banners loaded" }, { ...banners, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: tag_root, text: err.message }, null);
	});
};

export function rootGetBanner(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		BANNERS.findOne({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				...payload
			},
		}).then(banner => {
			if (!banner) {
				NotFoundError(res, { unique_id: tag_root, text: "Banner not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Banner loaded" }, banner);
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function publicGetBanners(req, res) {
	// const total_records = await BANNERS.count({ where: { status: default_status } });
	// const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	// const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	// const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	BANNERS.findAndCountAll({
		attributes: { exclude: ['id', 'image_public_id'] },
		where: {
			status: default_status
		},
		order: [
			['title', 'ASC']
			// [orderBy, sortBy]
		],
		distinct: true,
		// offset: pagination.start,
		// limit: pagination.limit
	}).then(banners => {
		if (!banners || banners.length == 0) {
			SuccessResponse(res, { unique_id: anonymous, text: "Banners Not found" }, []);
		} else {
			// SuccessResponse(res, { unique_id: anonymous, text: "Banners loaded" }, { ...banners, pages: pagination.pages });
			SuccessResponse(res, { unique_id: anonymous, text: "Banners loaded" }, { ...banners });
		}
	}).catch(err => {
		ServerError(res, { unique_id: anonymous, text: err.message }, null);
	});
};

export async function addBanner(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			if (req.file) {
				const uploadFileRes = await uploadFile(req.file, banner_document_path);

				if (uploadFileRes.success) {
					await db.sequelize.transaction(async (transaction) => {
						const banner = await BANNERS.create(
							{
								unique_id: uuidv4(),
								title: payload.title ? payload.title : null,
								url: payload.url ? payload.url : null,
								image: uploadFileRes.secure_url,
								image_public_id: uploadFileRes.public_id,
								status: default_status
							}, { transaction }
						);

						if (banner) {
							SuccessResponse(res, { unique_id: tag_root, text: "Banner created successfully!" });
						} else {
							throw new Error("Error adding banner");
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

export async function updateBanner(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const banner = await BANNERS.update(
					{
						title: payload.title ? payload.title : null,
						url: payload.url ? payload.url : null,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (banner > 0) {
					SuccessResponse(res, { unique_id: tag_root, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Banner not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function updateBannerImage(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const edit_details = await BANNERS.findOne({
				attributes: ["unique_id", "image", "image_public_id"],
				where: {
					unique_id: payload.unique_id
				}
			});

			if (!edit_details) {
				NotFoundError(res, { unique_id: tag_root, text: "Banner not found" }, null);
			} else {
				if (req.file) {
					const uploadFileRes = await uploadFile(req.file, banner_document_path);

					if (uploadFileRes.success) {
						await db.sequelize.transaction(async (transaction) => {
							const banner = await BANNERS.update(
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

							if (banner > 0) {
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
			const details = await BANNERS.findOne({
				attributes: ['unique_id', 'status'],
				where: {
					...payload
				}
			});

			if (!details) {
				BadRequestError(res, { unique_id: tag_root, text: "Details not found!" });
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const banner = await BANNERS.update(
						{
							status: details.status === default_status ? default_delete_status : default_status,
						}, {
							where: {
								unique_id: details.unique_id,
							},
							transaction
						}
					);

					if (banner > 0) {
						SuccessResponse(res, { unique_id: tag_root, text: "Status updated successfully!" }, null);
					} else {
						throw new Error("Banner not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function deleteBanner(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const edit_details = await BANNERS.findOne({
				attributes: ["unique_id", "image", "image_public_id"],
				where: {
					unique_id: payload.unique_id
				}
			});

			if (!edit_details) {
				NotFoundError(res, { unique_id: tag_root, text: "Banner not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {

					const banner = await BANNERS.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (banner > 0) {
						OtherSuccessResponse(res, { unique_id: tag_root, text: "Banner was deleted successfully!" });

						// Delete former file available
						if (edit_details.image_public_id !== null) {
							deleteFile(edit_details.image_public_id);
						}
					} else {
						throw new Error("Error deleting banner");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};