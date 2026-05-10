// backend/middlewares/validate.middleware.js

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    // Đảm bảo chỉ bắt và format lỗi của Zod (ZodError)
    if (error.name === 'ZodError' || error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({ success: false, errors: formattedErrors });
    }
    // Nếu là lỗi khác, đẩy ra Global Handler tránh làm sập luồng
    next(error);
  }
};