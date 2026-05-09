// backend/middlewares/validate.middleware.js

// Middleware bắt lỗi schema Zod và trả về mảng lỗi chuẩn của PO
export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return res.status(400).json({ success: false, errors: formattedErrors });
  }
};