/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createTable('Url', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        originalUrl: {
            type: 'text',
            notNull: true,
        },
        shortCode: {
            type: 'text',
            notNull: true,
            unique: true,
        },
        clicks: {
            type: 'integer',
            default: 0,
        },
        createdAt: {
            type: 'timestamp',
            default: pgm.func('now()'),
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    gm.dropTable('Url');
};
