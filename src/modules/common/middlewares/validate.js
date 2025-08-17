function validate(schema, where = "body") {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[where]);
      req[where] = parsed;
      next();
    } catch (e) {
      if (e.errors) {
        return res.status(400).json({
          error: "ValidationError",
          details: e.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(e);
    }
  };
}

module.exports = { validate };
