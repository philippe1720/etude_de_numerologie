import { Router, type IRouter } from "express";
import healthRouter from "./health";
import numerologieRouter from "./numerologie";

const router: IRouter = Router();

router.use(healthRouter);
router.use(numerologieRouter);

export default router;
