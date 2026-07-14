exports.shorthands = undefined;

// Schema required by connect-pg-simple:
// https://github.com/voxpelli/node-connect-pg-simple#table-schema
exports.up = (pgm) => {
  pgm.createTable('session', {
    sid: { type: 'varchar', notNull: true, primaryKey: true },
    sess: { type: 'json', notNull: true },
    expire: { type: 'timestamp(6)', notNull: true },
  });

  pgm.createIndex('session', 'expire', { name: 'IDX_session_expire' });
};

exports.down = (pgm) => {
  pgm.dropTable('session');
};
