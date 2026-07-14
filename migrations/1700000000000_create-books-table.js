exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('books', {
    id: 'id',
    title: { type: 'text', notNull: true },
    author: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true },
    rating: { type: 'integer' },
    thoughts: { type: 'text' },
    started_on: { type: 'text' },
    finished_on: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('books', 'books_status_check', {
    check: "status IN ('want_to_read', 'reading', 'finished')",
  });
  pgm.addConstraint('books', 'books_rating_check', {
    check: 'rating IS NULL OR (rating BETWEEN 1 AND 5)',
  });
};

exports.down = (pgm) => {
  pgm.dropTable('books');
};
