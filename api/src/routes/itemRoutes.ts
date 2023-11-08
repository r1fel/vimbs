import express from 'express';
import {defaultRoute} from './defaultRoutes';

export const itemRoutes = express.Router();

itemRoutes.use(defaultRoute);
