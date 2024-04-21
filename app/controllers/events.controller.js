import { validationResult, matchedData } from 'express-validator';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import {
	default_delete_status, default_status, false_status, paginate, tag_root, true_status, return_all_letters_uppercase, event_document_path, 
	anonymous, zero, strip_text, timestamp_str_alt
} from '../config/config.js';
import db from "../models/index.js";
import { uploadFile, deleteFile } from '../config/cloudinary.js';

const EVENTS = db.events;
const Op = db.Sequelize.Op;

export async function rootGetEvents(req, res) {
	const total_records = await EVENTS.count();
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	EVENTS.findAndCountAll({
		attributes: { exclude: ['id', 'image_public_id'] },
		order: [
			[orderBy, sortBy]
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(events => {
		if (!events || events.length === 0) {
			SuccessResponse(res, { unique_id: tag_root, text: "Events Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: tag_root, text: "Events loaded" }, { ...events, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: tag_root, text: err.message }, null);
	});
};

export function rootGetEvent(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		EVENTS.findOne({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				...payload
			}
		}).then(event => {
			if (!event) {
				NotFoundError(res, { unique_id: tag_root, text: "Event not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Event loaded" }, event);
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function rootSearchEvents(req, res) {
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await EVENTS.count({
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

		EVENTS.findAndCountAll({
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
		}).then(events => {
			if (!events || events.length === 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Events Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Events loaded" }, { ...events, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function publicGetEvents(req, res) {
	// const total_records = await EVENTS.count({ where: { status: default_status } });
	// const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	// const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	// const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	EVENTS.findAndCountAll({
		attributes: { exclude: ['id', 'image_public_id', 'description'] },
		where: {
			status: default_status
		},
		order: [
			['start', 'ASC']
			// [orderBy, sortBy]
		],
		distinct: true,
		// offset: pagination.start,
		// limit: pagination.limit
	}).then(events => {
		if (!events || events.length == 0) {
			SuccessResponse(res, { unique_id: anonymous, text: "Events Not found" }, []);
		} else {
			// SuccessResponse(res, { unique_id: anonymous, text: "Events loaded" }, { ...events, pages: pagination.pages });
			SuccessResponse(res, { unique_id: anonymous, text: "Events loaded" }, { ...events });
		}
	}).catch(err => {
		ServerError(res, { unique_id: anonymous, text: err.message }, null);
	});
};

export async function publicGetEventsSpecifically(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		// const total_records = await EVENTS.count({ where: { ...payload, start: { [Op.gte]: timestamp_str_alt(new Date()), }, status: default_status } });
		// const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		// const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		// const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";
	
		EVENTS.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id', 'description'] },
			where: {
				...payload,
				start: {
					[Op.gte]: timestamp_str_alt(new Date()),
				},
				status: default_status
			},
			order: [
				['start', 'ASC']
				// [orderBy, sortBy]
			],
			distinct: true,
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(events => {
			if (!events || events.length == 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Events Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Events loaded" }, { ...events, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Events loaded" }, { ...events });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export function publicGetEventSpecifically(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		EVENTS.findOne({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				...payload,
				status: default_status
			}
		}).then(async event => {
			if (!event) {
				NotFoundError(res, { unique_id: anonymous, text: "Event specifically not found" }, null);
			} else {
				const event_view_update = await EVENTS.increment({ views: 1 }, { where: { ...payload } });
				SuccessResponse(res, { unique_id: anonymous, text: "Event specifically loaded" }, event);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicSearchEvents(req, res) {
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await EVENTS.count({
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

		EVENTS.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id', 'description'] },
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
		}).then(events => {
			if (!events || events.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Events Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Events loaded" }, { ...events, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addEvent(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			if (req.file) {
				const uploadFileRes = await uploadFile(req.file, event_document_path);

				if (uploadFileRes.success) {
					await db.sequelize.transaction(async (transaction) => {
						const event = await EVENTS.create(
							{
								unique_id: uuidv4(),
								...payload,
								stripped: strip_text(payload.name),
								end: payload.end ? payload.end : null,
								description: payload.description ? payload.description : null,
								image: uploadFileRes.secure_url,
								image_public_id: uploadFileRes.public_id,
								views: zero,
								status: default_status
							}, { transaction }
						);

						if (event) {
							SuccessResponse(res, { unique_id: tag_root, text: "Event created successfully!" });
						} else {
							throw new Error("Error adding event");
						}
					});
				} else {
					BadRequestError(res, { unique_id: tag_root, text: "Error uploading image!" }, null);
				}
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const event = await EVENTS.create(
						{
							unique_id: uuidv4(),
							...payload,
							stripped: strip_text(payload.name),
							end: payload.end ? payload.end : null,
							description: payload.description ? payload.description : null,
							image: null,
							image_public_id: null,
							views: zero,
							status: default_status
						}, { transaction }
					);

					if (event) {
						SuccessResponse(res, { unique_id: tag_root, text: "Event created successfully!" });
					} else {
						throw new Error("Error adding event");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function updateEventName(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const event = await EVENTS.update(
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

				if (event > 0) {
					SuccessResponse(res, { unique_id: tag_root, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Event not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function updateEventType(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const event = await EVENTS.update(
					{
						...payload,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (event > 0) {
					SuccessResponse(res, { unique_id: tag_root, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Event not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function updateEventLocation(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const event = await EVENTS.update(
					{
						...payload,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (event > 0) {
					SuccessResponse(res, { unique_id: tag_root, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Event not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function updateEventDuration(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const event = await EVENTS.update(
					{
						...payload,
						end: payload.end ? payload.end : null,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (event > 0) {
					SuccessResponse(res, { unique_id: tag_root, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Event not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function updateEventDescription(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const event = await EVENTS.update(
					{
						description: payload.description ? payload.description : null,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (event > 0) {
					SuccessResponse(res, { unique_id: tag_root, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Event not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function updateEventImage(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const edit_details = await EVENTS.findOne({
				attributes: ["unique_id", "image", "image_public_id"],
				where: {
					unique_id: payload.unique_id
				}
			});

			if (!edit_details) {
				NotFoundError(res, { unique_id: tag_root, text: "Event not found" }, null);
			} else {
				if (req.file) {
					const uploadFileRes = await uploadFile(req.file, event_document_path);

					if (uploadFileRes.success) {
						await db.sequelize.transaction(async (transaction) => {
							const event = await EVENTS.update(
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

							if (event > 0) {
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
			const details = await EVENTS.findOne({
				attributes: ['unique_id', 'status'],
				where: {
					...payload
				}
			});

			if (!details) {
				BadRequestError(res, { unique_id: tag_root, text: "Details not found!" });
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const event = await EVENTS.update(
						{
							status: details.status === default_status ? default_delete_status : default_status,
						}, {
							where: {
								unique_id: details.unique_id,
							},
							transaction
						}
					);

					if (event > 0) {
						SuccessResponse(res, { unique_id: tag_root, text: "Status updated successfully!" }, null);
					} else {
						throw new Error("Event not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function deleteEvent(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const edit_details = await EVENTS.findOne({
				attributes: ["unique_id", "image", "image_public_id"],
				where: {
					unique_id: payload.unique_id
				}
			});

			if (!edit_details) {
				NotFoundError(res, { unique_id: tag_root, text: "Event not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {

					const event = await EVENTS.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (event > 0) {
						OtherSuccessResponse(res, { unique_id: tag_root, text: "Event was deleted successfully!" });

						// Delete former file available
						if (edit_details.image_public_id !== null) {
							deleteFile(edit_details.image_public_id);
						}
					} else {
						throw new Error("Error deleting event");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};