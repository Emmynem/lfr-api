import { db_end, db_start } from "../config/config";

export default (sequelize, Sequelize) => {

	const events = sequelize.define("event", {
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
		name: {
			type: Sequelize.STRING(300),
			allowNull: false,
		},
		stripped: {
			type: Sequelize.STRING(300),
			allowNull: false,
			unique: true
		},
		type: {
			type: Sequelize.STRING(20),
			allowNull: false,
		},
		location: {
			type: Sequelize.STRING(300),
			allowNull: false,
		},
		start: {
			type: Sequelize.DATE,
			allowNull: false,
		},
		end: {
			type: Sequelize.DATE,
			allowNull: true,
		},
		description: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
		views: {
			type: Sequelize.BIGINT,
			allowNull: false,
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
		tableName: `${db_start}events${db_end}`
	});
	return events;
};
