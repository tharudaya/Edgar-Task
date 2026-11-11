export const config = {
  port: Number(process.env.PORT ?? 3001),
  secUserAgent: process.env.SEC_USER_AGENT ?? '',
};