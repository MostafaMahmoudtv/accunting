export const startOfMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);

export const endOfMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

export const monthsAgo = (n) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - n, 1);
};
