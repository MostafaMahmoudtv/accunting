export const success = (res, data, meta = null) => {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(200).json(payload);
};

export const created = (res, data) => res.status(201).json({ success: true, data });

export const noContent = (res) => res.status(204).send();

export const fail = (res, statusCode, message, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};
