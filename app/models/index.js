import { DB, USER, PASSWORD, HOST, dialect as _dialect, logging as _logging, pool as _pool, dialectOptions as _dialectOptions, timezone, production } from "../config/db.config.js";
import Sequelize from "sequelize";
import appDefaultsModel from "./appDefaults.model.js";
import apiKeysModel from "./apiKeys.model.js";
import bannersModel from "./banners.model.js";
import categoriesModel from "./categories.model.js";
import eventsModel from "./events.model.js";
import postsModel from "./posts.model.js";

const sequelize = new Sequelize(
    DB,
    USER,
    PASSWORD,
    {
        host: HOST,
        dialect: _dialect,
        logging: _logging,
        operatorsAliases: 0,
        pool: {
            max: _pool.max,
            min: _pool.min,
            acquire: _pool.acquire,
            idle: _pool.idle,
            evict: _pool.evict
        },
        dialectOptions: {
            // useUTC: _dialectOptions.useUTC, 
            dateStrings: _dialectOptions.dateStrings,
            typeCast: _dialectOptions.typeCast
        },
        timezone: timezone
    }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// * Binding models
db.api_keys = apiKeysModel(sequelize, Sequelize);
db.app_defaults = appDefaultsModel(sequelize, Sequelize);
db.banners = bannersModel(sequelize, Sequelize);
db.categories = categoriesModel(sequelize, Sequelize);
db.events = eventsModel(sequelize, Sequelize);
db.posts = postsModel(sequelize, Sequelize);

// End - Binding models

// Associations

//    - Post Associations
db.categories.hasMany(db.posts, { foreignKey: 'category_unique_id', sourceKey: 'unique_id' });
db.posts.belongsTo(db.categories, { foreignKey: 'category_unique_id', targetKey: 'unique_id' });

// End - Associations

export default db;