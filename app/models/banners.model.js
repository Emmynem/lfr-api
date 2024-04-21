import { db_end, db_start } from "../config/config";

export default (sequelize, Sequelize) => {

	const banners = sequelize.define("banner", {
		id: {
			type: Sequelize.BIGINT,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		unique_id: {
			type: Sequelize.STRING(40),
			allowNull: false,
			unique: true
		},
		title: {
			type: Sequelize.STRING(500),
			allowNull: true,
		},
		url: {
			type: Sequelize.STRING(500),
			allowNull: true,
		},
		image: {
			type: Sequelize.STRING(500),
			allowNull: true,
		},
		image_public_id: {
			type: Sequelize.STRING(500),
			allowNull: true,
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: `${db_start}banners${db_end}`
	});
	return banners;
};
