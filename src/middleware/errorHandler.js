function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function notFound(req, res) {
  res.status(404).json({ error: 'Not found', path: req.path });
}

function errorHandler(err, req, res, next) {
  res.status(err.status || 500).json({ error: err.message || 'Internal error' });
}

module.exports = { asyncHandler, notFound, errorHandler };
