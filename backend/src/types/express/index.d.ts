// src/types/express/index.d.ts

import type { JwtPayload } from '../../middleware/auth';

declare module 'express-serve-static-core' {
  interface Request {
    /**
     * Populated by requireAuth middleware.
     */
    user?: JwtPayload;
  }
}
