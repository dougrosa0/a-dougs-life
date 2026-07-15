exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('books', {
    category: { type: 'text', notNull: true, default: 'fun' },
  });

  pgm.addConstraint('books', 'books_category_check', {
    check: "category IN ('fun', 'learning')",
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('books', 'books_category_check');
  pgm.dropColumn('books', 'category');
};
